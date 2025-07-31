import mongoose from 'mongoose';
import * as QRCode from 'qrcode';
import { RootFilterQuery } from 'mongoose';

import {
  Injectable,
  NotFoundException,
<<<<<<< HEAD
  BadRequestException,
=======
>>>>>>> main
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import sortHelper from 'src/helpers/sort.helper';
import sendMailHelper from 'src/helpers/sendMail.helper';
import paginationHelper from 'src/helpers/pagination.helper';

import { LoginDto } from '../auth/dto/login.dto';
import { Role } from '../roles/schemas/role.schema';
import { UsersService } from '../users/users.service';
import { Degree } from '../degrees/schemas/degree.schema';
import { Certificate } from '../certificates/schemas/certificate.schema';

import {
  UpdateVerificationBodyDto,
  UpdateVerificationParamDto,
} from './dto/update-verification.dto';
import { Verification } from './schemas/verification.schema';
import { FindVerificationsQueryDto } from './dto/find-verifications.dto';
import { CreateVerificationBodyDto } from './dto/create-verification.dto';
import { DeleteVerificationParamDto } from './dto/delete-verification.dto';
import { FindVerificationByIdParamDto } from './dto/find-verification-by-id.dto';
<<<<<<< HEAD
import { FindVerificationsQueryDto } from './dto/find-verifications.dto';

import { LoginDto } from '../auth/dto/login.dto';
import paginationHelper from 'src/helpers/pagination.helper';
import sortHelper from 'src/helpers/sort.helper';
import sendMailHelper from 'src/helpers/sendMail.helper';
import { UsersService } from '../users/users.service';
import { Role } from '../roles/schemas/role.schema';
=======
import { IssuingAgenciesService } from '../issuing-agencies/issuing-agencies.service';
>>>>>>> main

@Injectable()
export class VerificationsService {
  constructor(
    @InjectModel(Verification.name)
    private readonly model: mongoose.Model<Verification>,

    @InjectModel(Degree.name)
    private readonly degreeModel: mongoose.Model<Degree>,
    @InjectModel(Certificate.name)
    private readonly certificateModel: mongoose.Model<Certificate>,

<<<<<<< HEAD
=======
    private readonly issuingAgenciesService: IssuingAgenciesService,

>>>>>>> main
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
      isDeleted: false,
      createdBy: { userId: user.userId, createdAt: new Date() },
    };

    const newVerification = await this.create({ doc: doc as Verification });

    // Gửi mail
    let studentEmail: string | undefined;
    let hash = '';

    if (body.type === 'degree' && body.degreeId) {
      const degree = await this.degreeModel.findOneAndUpdate(
        { _id: body.degreeId },
        { status: 'success' },
      );
      if (degree) {
        studentEmail = degree.studentEmail;
        hash = degree.degreeHash;

        const date = new Date(degree.issuedDate);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        const issuerExists = await this.issuingAgenciesService.findOne({
          filter: { _id: degree.issuerID },
        });

        const qrContent = `Tên bằng cấp: ${degree.degreeName}\nChuyên ngành: ${degree.major}\nĐiểm GPA: ${degree.GPA}\nXếp loại: ${degree.classification}\nNgày phát hành: ${formattedDate}\nTrạng thái ${degree.status}\nEmail sở hữu: ${degree.studentEmail}\nTên nhà phát hành: ${issuerExists?.name}\nEmail nhà phát hành: ${issuerExists?.email}\nChuỗi băm: ${degree.degreeHash}`;
        let qrCode = '';

        QRCode.toString(
          qrContent,
          {
            errorCorrectionLevel: 'H',
            type: 'svg',
          },
          function (err, data) {
            if (err) throw err;

            qrCode = data;
          },
        );

        await this.degreeModel.findOneAndUpdate(
          { _id: body.degreeId },
          { qrCode },
        );
      }
    } else if (body.type === 'certificate' && body.certificateId) {
      const certificate = await this.certificateModel.findOneAndUpdate(
        { _id: body.certificateId },
        { status: 'success' },
      );
      if (certificate) {
        studentEmail = certificate.studentEmail;
        hash = certificate.certificateHash;

        const date = new Date(certificate.issuedDate);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        const issuerExists = await this.issuingAgenciesService.findOne({
          filter: { _id: certificate.issuerID },
        });

        const qrContent = `Tiêu đề chứng chỉ: ${certificate.title}\nKỉ lục: ${certificate.score}\nChi tiết kỉ lục: ${certificate.scoreDetails}\nNgày phát hành: ${formattedDate}\nTrạng thái ${certificate.status}\nEmail sở hữu: ${certificate.studentEmail}\nTên nhà phát hành: ${issuerExists?.name}\nEmail nhà phát hành: ${issuerExists?.email}\nChuỗi băm: ${certificate.certificateHash}`;
        let qrCode = '';

        QRCode.toString(
          qrContent,
          {
            errorCorrectionLevel: 'H',
            type: 'svg',
          },
          function (err, data) {
            if (err) throw err;

            qrCode = data;
          },
        );

        await this.certificateModel.findOneAndUpdate(
          { _id: body.degreeId },
          { qrCode },
        );
      }
    }

    sendMailHelper({
      email: studentEmail as string,
      subject: 'HTQL Văn Bằng Và Chứng Chỉ: Xác minh thành công!',
      html: `
            <h1>Xin chào</h1>
            <p>Giấy tờ của bạn đã được xác minh.</p>
            <p><strong>Chi tiết:</strong></p>
            <ul>
              <li><strong>ID xác minh:</strong> ${newVerification.id}</li>
              <li><strong>Chuỗi băm giấy tờ:</strong> ${hash}</li>
              <li><strong>Trạng thái chứng chỉ:</strong> Thành công</li>
            </ul>

            <p>Vui lòng viếng thăm website: <a href="http://localhost:5173/client-login">Tại đây</a>.</p>
            <p>Sau đó đăng nhập với tài khoản google của email này để xem chi tiết.</p>
          `,
    });

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
    let hash = '';

    if (deleted.type === 'degree' && deleted.degreeId) {
      const degree = await this.degreeModel.findOneAndUpdate(
        { _id: deleted.degreeId },
        { status: 'revoke', qrCode: 'n' },
      );
      if (degree) {
        studentEmail = degree.studentEmail;
        hash = degree.degreeHash;
      }
    } else if (deleted.type === 'certificate' && deleted.certificateId) {
      const certificate = await this.certificateModel.findOneAndUpdate(
        { _id: deleted.certificateId },
        { status: 'revoke', qrCode: 'n' },
      );
      if (certificate) {
        studentEmail = certificate.studentEmail;
        hash = certificate.certificateHash;
      }
    }

    sendMailHelper({
      email: studentEmail as string,
      subject: 'HTQL Văn Bằng Và Chứng Chỉ: Xác minh Bị Thu Hồi!',
      html: `
            <h1>Xin chào</h1>
            <p>Giấy tờ của bạn đã bị thu hồi xác minh.</p>
            <p><strong>Chi tiết:</strong></p>
            <ul>
              <li><strong>ID xác minh:</strong> ${param.id}</li>
              <li><strong>Chuỗi băm giấy tờ:</strong> ${hash}</li>
              <li><strong>Trạng thái chứng chỉ:</strong> Thu hồi</li>
            </ul>
            
            <p>Vui lòng viếng thăm website: <a href="http://localhost:5173/client-login">Tại đây</a>.</p>
            <p>Sau đó đăng nhập với tài khoản google của email này để xem chi tiết.</p>
          `,
    });

    return {};
  }

  async findVerifications(query: FindVerificationsQueryDto) {
    const { filter, page = 1, limit = 20 } = query;
    const filterOptions: any = {};
    const pagination = paginationHelper(page, limit);
    let sort = {};

    if (filter) {
      const { type, verifierId, sortBy, sortOrder } = filter;
      if (type) filterOptions.type = type as string;
      if (verifierId) filterOptions.verifierId = verifierId as string;
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
