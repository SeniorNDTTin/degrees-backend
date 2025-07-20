// src/apis/verifications/verifications.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Degree } from '../degrees/schemas/degree.schema';
import { Certificate } from '../certificates/schemas/certificate.schema';


import { Verification } from './schemas/verification.schema';
import { CreateVerificationBodyDto } from './dto/create-verification.dto';
import { UpdateVerificationBodyDto, UpdateVerificationParamDto } from './dto/update-verification.dto';
import { DeleteVerificationParamDto } from './dto/delete-verification.dto';
import { FindVerificationByIdParamDto } from './dto/find-verification-by-id.dto';
import { FindVerificationsQueryDto } from './dto/find-verifications.dto';

import { LoginDto } from '../auth/dto/login.dto';
import paginationHelper from 'src/helpers/pagination.helper';
import sortHelper from 'src/helpers/sort.helper';

@Injectable()
export class VerificationsService {
  constructor(
    @InjectModel(Verification.name) private readonly model: mongoose.Model<Verification>,
    
    @InjectModel(Degree.name) private readonly degreeModel: mongoose.Model<Degree>,
    @InjectModel(Certificate.name)
private readonly certificateModel: mongoose.Model<Certificate>,

  ) {}

  async create({ doc }: { doc: Verification }) {
    return new this.model(doc).save();
  }

  async countDocuments(filter: any) {
    filter.isDeleted = false;
    return this.model.countDocuments(filter);
  }

  async find(filter: any, sort: any = {}, skip = 0, limit = 20) {
    filter.isDeleted = false;
    return this.model.find(filter).sort(sort).skip(skip).limit(limit);
  }

  async findOne(filter: any) {
    filter.isDeleted = false;
    return this.model.findOne(filter);
  }

  async findOneAndUpdate(filter: any, update: any) {
    filter.isDeleted = false;
    return this.model.findOneAndUpdate(filter, update, { new: true, runValidators: true });
  }

  async createVerification(user: LoginDto, body: CreateVerificationBodyDto) {
  const doc: any = {
    ...body,
    status: false, // mặc định
    isDeleted: false,
    createdBy: { userId: user.userId, createdAt: new Date() },
  };

  return this.create({ doc: doc as Verification });
}


 async updateVerification(
  user: LoginDto,
  param: UpdateVerificationParamDto,
  body: UpdateVerificationBodyDto
) {
  // 🔍 Bước 1: Tìm bản ghi Verification
  const verification = await this.findOne({ _id: param.id });
  if (!verification) throw new NotFoundException('Verification not found');

  // 🔍 Bước 2: Kiểm tra thông tin sinh viên với Degree
  if (verification.type === 'degree') {
    const degree = await this.degreeModel.findById(verification.degreeId);
    if (!degree) throw new NotFoundException('Degree not found');

    // So sánh studentEmail
   
    if (degree.studentEmail.trim().toLowerCase() !== body.studentEmail.trim().toLowerCase()) {
      throw new BadRequestException('Email sinh viên không khớp với bằng cấp ');
    }
  }

    if (verification.type === 'certificate') {
    const certificate = await this.certificateModel.findById(verification.certificateId);
    if (!certificate) throw new NotFoundException('Certificate not found');

    if (
      certificate.studentEmail.trim().toLowerCase() !==
      body.studentEmail.trim().toLowerCase()
    ) {
      throw new BadRequestException('Email sinh viên không khớp với chứng chỉ');
    }
  }


  // 🔄 Bước 3: Cập nhật bản ghi xác minh nếu thông tin hợp lệ
  const updated = await this.findOneAndUpdate(
    { _id: param.id },
    {
      ...body,
      $push: {
        updatedBy: { userId: user.userId, updatedAt: new Date() },
      },
    },
  );

  if (!updated) throw new NotFoundException('Verification not found');
  


  return updated;
}


  async deleteVerification(user: LoginDto, param: DeleteVerificationParamDto) {
    const deleted = await this.findOneAndUpdate(
      { _id: param.id },
      { isDeleted: true, deletedBy: { userId: user.userId, deletedAt: new Date() } },
    );
    if (!deleted) throw new NotFoundException('Verification not found');
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
      this.countDocuments(filterOptions),
      this.find(filterOptions, sort, pagination.skip, pagination.limit),
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
    const found = await this.findOne({ _id: param.id });
    if (!found) throw new NotFoundException('Verification not found');
    return found;
  }
}
