// src/apis/verifications/verifications.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Degree } from '../degrees/schemas/degree.schema';
import { Certificate } from '../certificates/schemas/certificate.schema';
import { RootFilterQuery } from 'mongoose';

import { Verification } from './schemas/verification.schema';
import { CreateVerificationBodyDto } from './dto/create-verification.dto';
import {
  UpdateVerificationBodyDto,
  UpdateVerificationParamDto,
} from './dto/update-verification.dto';
import { DeleteVerificationParamDto } from './dto/delete-verification.dto';
import { FindVerificationByIdParamDto } from './dto/find-verification-by-id.dto';
import { FindVerificationsQueryDto } from './dto/find-verifications.dto';

import { LoginDto } from '../auth/dto/login.dto';
import paginationHelper from 'src/helpers/pagination.helper';
import sortHelper from 'src/helpers/sort.helper';
import sendMailHelper from 'src/helpers/sendMail.helper';
import { UsersService } from '../users/users.service';
import { Role } from '../roles/schemas/role.schema';

@Injectable()
export class VerificationsService {
  constructor(
    @InjectModel(Verification.name)
    private readonly model: mongoose.Model<Verification>,

    @InjectModel(Degree.name)
    private readonly degreeModel: mongoose.Model<Degree>,
    @InjectModel(Certificate.name)
    private readonly certificateModel: mongoose.Model<Certificate>,

    private readonly usersService: UsersService,
  ) {}

  async create({ doc }: { doc: Verification }) {
    return new this.model(doc).save();
  }

  async countDocuments({ filter }: { filter: RootFilterQuery<Verification> }) {
    filter['isDeleted'] = false;
    return this.model.countDocuments(filter);
  }

  async find({
    filter,
    sort = {},
    skip = 0,
    limit = 20,
  }: {
    filter: mongoose.FilterQuery<Verification>;
    sort?: { [key: string]: mongoose.SortOrder };
    skip?: number;
    limit?: number;
  }) {
    filter.isDeleted = false;

    return this.model.find(filter).sort(sort).skip(skip).limit(limit);
  }

  async findOne({ filter }: { filter: RootFilterQuery<Verification> }) {
    filter['isDeleted'] = false;
    return this.model.findOne(filter);
  }

  async findOneAndUpdate({
    filter,
    update,
    options = {},
  }: {
    filter: RootFilterQuery<Verification>;
    update: mongoose.UpdateQuery<Verification>;
    options?: mongoose.QueryOptions;
  }) {
    filter['isDeleted'] = false;
    return this.model.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  async checkPermissions({
    userId,
    permission,
  }: {
    userId: string;
    permission: string;
  }) {
    const userExists = await this.usersService.findOne({
      filter: { _id: userId },
      populate: [{ path: 'roleId', select: 'permissions' }],
    });
    if (!userExists) {
      throw new ForbiddenException();
    }
    const { permissions } = userExists.roleId as unknown as Role;
    if (!permissions.includes(permission)) {
      throw new ForbiddenException();
    }
  }

  async createVerification(user: LoginDto, body: CreateVerificationBodyDto) {
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'create-verification',
    });

    const doc: any = {
      ...body,
      status: false,
      isDeleted: false,
      createdBy: { userId: user.userId, createdAt: new Date() },
    };

    const newVerification = this.create({ doc: doc as Verification });

    // Gửi mail
    let studentEmail: string | undefined;
    if (body.type === 'degree' && body.degreeId) {
      const degree = await this.degreeModel.findById(body.degreeId);
      if (degree) {
        studentEmail = degree.studentEmail;
      }
    } else if (body.type === 'certificate' && body.certificateId) {
      const certificate = await this.certificateModel.findById(
        body.certificateId,
      );
      if (certificate) {
        studentEmail = certificate.studentEmail;
      }
    }

    if (studentEmail) {
      try {
        await sendMailHelper({
          email: studentEmail,
          subject: 'Thông báo: Yêu cầu xác minh mới',
          html: `
            <h1>Xin chào</h1>
            <p>Một yêu cầu xác minh mới đã được tạo cho bạn.</p>
            <p><strong>Chi tiết:</strong></p>
            <ul>
              <li><strong>ID xác minh:</strong> ${(await newVerification)._id}</li>
              <li><strong>Loại tài liệu:</strong> ${body.type === 'degree' ? 'Bằng cấp' : 'Chứng chỉ'}</li>
              <li><strong>Mô tả:</strong> ${body.description}</li>
              <li><strong>Người xác minh (ID):</strong> ${body.verifierId}</li>
              <li><strong>Trạng thái:</strong> Chưa xác minh</li>
            </ul>
            <p>Vui lòng liên hệ quản trị viên nếu có thắc mắc.</p>
          `,
        });
      } catch (error) {
        console.error('Lỗi gửi email:', error);
      }
    }

    return newVerification;
  }

  async updateVerification(
    user: LoginDto,
    param: UpdateVerificationParamDto,
    body: UpdateVerificationBodyDto,
  ) {
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'update-verification',
    });

    //Tìm bản ghi Verification
    const verification = await this.findOne({ filter: { _id: param.id } });
    if (!verification) throw new NotFoundException('Verification not found');

    // Cập nhật bản ghi xác minh
    const updated = await this.findOneAndUpdate({
      filter: { _id: param.id },
      update: {
        ...body,
        $push: {
          updatedBy: { userId: user.userId, updatedAt: new Date() },
        },
      },
    });

    if (!updated) throw new NotFoundException('Verification not found');

    let studentEmail = '';
    if (body.type === 'degree') {
      const degreeExists = await this.degreeModel.findOne({
        _id: body.degreeId,
      });
      if (degreeExists) {
        studentEmail = degreeExists.studentEmail;
      }
    } else {
      const certificateExists = await this.certificateModel.findOne({
        _id: body.certificateId,
      });
      if (certificateExists) {
        studentEmail = certificateExists.studentEmail;
      }
    }

    if (studentEmail) {
      try {
        await sendMailHelper({
          email: studentEmail,
          subject: 'Thông báo: Yêu cầu xác minh đã được cập nhật',
          html: `
            <h1>Xin chào</h1>
            <p>Yêu cầu xác minh của bạn đã được cập nhật.</p>
            <p><strong>Chi tiết:</strong></p>
            <ul>
              <li><strong>ID xác minh:</strong> ${updated._id}</li>
              <li><strong>Loại tài liệu:</strong> ${updated.type === 'degree' ? 'Bằng cấp' : 'Chứng chỉ'}</li>
              <li><strong>Mô tả:</strong> ${updated.description}</li>
              <li><strong>Người xác minh (ID):</strong> ${updated.verifierId}</li>
              <li><strong>Trạng thái:</strong> ${updated.status ? 'Đã xác minh' : 'Chưa xác minh'}</li>
            </ul>
            <p>Vui lòng liên hệ quản trị viên nếu có thắc mắc.</p>
          `,
        });
      } catch (error) {
        console.error('Lỗi gửi email:', error);
      }
    }

    return updated;
  }

  async deleteVerification(user: LoginDto, param: DeleteVerificationParamDto) {
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'delete-verification',
    });

    const deleted = await this.findOneAndUpdate({
      filter: { _id: param.id },
      update: {
        isDeleted: true,
        deletedBy: { userId: user.userId, deletedAt: new Date() },
      },
    });

    if (!deleted) throw new NotFoundException('Verification not found');

    // Gửi mail
    let studentEmail: string | undefined;
    if (deleted.type === 'degree' && deleted.degreeId) {
      const degree = await this.degreeModel.findById(deleted.degreeId);
      if (degree) {
        studentEmail = degree.studentEmail;
      }
    } else if (deleted.type === 'certificate' && deleted.certificateId) {
      const certificate = await this.certificateModel.findById(
        deleted.certificateId,
      );
      if (certificate) {
        studentEmail = certificate.studentEmail;
      }
    }

    if (studentEmail) {
      try {
        await sendMailHelper({
          email: studentEmail,
          subject: 'Thông báo: Yêu cầu xác minh đã bị xóa',
          html: `
            <h1>Xin chào</h1>
            <p>Yêu cầu xác minh của bạn đã bị xóa.</p>
            <p><strong>Chi tiết:</strong></p>
            <ul>
              <li><strong>ID xác minh:</strong> ${deleted._id}</li>
              <li><strong>Loại tài liệu:</strong> ${deleted.type === 'degree' ? 'Bằng cấp' : 'Chứng chỉ'}</li>
              <li><strong>Mô tả:</strong> ${deleted.description}</li>
              <li><strong>Người xác minh (ID):</strong> ${deleted.verifierId}</li>
            </ul>
            <p>Vui lòng liên hệ quản trị viên nếu có thắc mắc.</p>
          `,
        });
      } catch (error) {
        console.error('Lỗi gửi email:', error);
      }
    }

    return {};
  }

  async findVerifications(query: FindVerificationsQueryDto) {
    const { filter, page = 1, limit = 20 } = query;
    const filterOptions: any = {};
    const pagination = paginationHelper(page, limit);
    let sort = {};

    if (filter) {
      const { type, verifierId, status, sortBy, sortOrder } = filter;
      if (type) filterOptions.type = type as string;
      if (verifierId) filterOptions.verifierId = verifierId as string;
      if (typeof status !== 'undefined') filterOptions.status = status as string;
      sort = sortHelper(sortBy as string, sortOrder as string);
    }

    const [total, items] = await Promise.all([
      this.countDocuments({ filter: filterOptions }),
      this.find({
        filter: filterOptions,
        sort,
        skip: pagination.skip,
        limit: pagination.limit,
      }),
    ]);

    return {
      verifications: {
        total,
        page,
        limit,
        items,
      },
    };
  }

  async findVerificationById(param: FindVerificationByIdParamDto) {
    const found = await this.findOne({ filter: { _id: param.id } });
    if (!found) throw new NotFoundException('Verification not found');
    return found;
  }
}
