// src/apis/verifications/verifications.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
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

@Injectable()
export class VerificationsService {
  constructor(
    @InjectModel(Verification.name)
    private readonly model: mongoose.Model<Verification>,

    @InjectModel(Degree.name)
    private readonly degreeModel: mongoose.Model<Degree>,
    @InjectModel(Certificate.name)
    private readonly certificateModel: mongoose.Model<Certificate>,
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

  async createVerification(user: LoginDto, body: CreateVerificationBodyDto) {
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
      const certificate = await this.certificateModel.findById(body.certificateId);
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
    //Tìm bản ghi Verification
    const verification = await this.findOne({ filter: { _id: param.id } });
    if (!verification) throw new NotFoundException('Verification not found');

    // Kiểm tra thông tin sinh viên với Degree
    if (verification.type === 'degree') {
      const degree = await this.degreeModel.findById(verification.degreeId);
      if (!degree) throw new NotFoundException('Degree not found');

      if (
        degree.studentEmail.trim().toLowerCase() !==
        body.studentEmail.trim().toLowerCase()
      ) {
        throw new BadRequestException(
          'Email sinh viên không khớp với bằng cấp',
        );
      }
    }

    // Kiểm tra với Certificate
    if (verification.type === 'certificate') {
      const certificate = await this.certificateModel.findById(
        verification.certificateId,
      );
      if (!certificate) throw new NotFoundException('Certificate not found');

      if (
        certificate.studentEmail.trim().toLowerCase() !==
        body.studentEmail.trim().toLowerCase()
      ) {
        throw new BadRequestException(
          'Email sinh viên không khớp với chứng chỉ',
        );
      }
    }

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

    // Gửi mail
    let studentEmail: string | undefined;
    if (body.studentEmail) {
      studentEmail = body.studentEmail;
    } else if (updated.type === 'degree' && updated.degreeId) {
      const degree = await this.degreeModel.findById(updated.degreeId);
      if (degree) {
        studentEmail = degree.studentEmail;
      }
    } else if (updated.type === 'certificate' && updated.certificateId) {
      const certificate = await this.certificateModel.findById(updated.certificateId);
      if (certificate) {
        studentEmail = certificate.studentEmail;
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
      const certificate = await this.certificateModel.findById(deleted.certificateId);
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
      if (type) filterOptions.type = type;
      if (verifierId) filterOptions.verifierId = verifierId;
      if (typeof status !== 'undefined') filterOptions.status = status;
      sort = sortHelper(sortBy, sortOrder);
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
