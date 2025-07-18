import mongoose, { RootFilterQuery } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';

import sortHelper from 'src/helpers/sort.helper';
import paginationHelper from 'src/helpers/pagination.helper';

import { LoginDto } from '../auth/dto/login.dto';
import { Certificate } from './schemas/certificate.schema';
import { FindCertificatesQueryDto } from './dto/find-certificates.dto';
import { CreateCertificateBodyDto } from './dto/create-certificate.dto';
import { DeleteCertificateParamDto } from './dto/delete-certificate.dto';
import { FindCertificateByIdParamDto } from './dto/find-certificate-by-id.dto';
import {
  UpdateCertificateBodyDto,
  UpdateCertificateParamDto,
} from './dto/update-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(Certificate.name)
    private readonly certificateModel: mongoose.Model<Certificate>,
  ) {}

  async create({ doc }: { doc: Certificate }) {
    const newCertificate = new this.certificateModel(doc);
    return await newCertificate.save();
  }

  async countDocuments({ filter }: { filter: RootFilterQuery<Certificate> }) {
    filter['isDeleted'] = false;
    return await this.certificateModel.countDocuments(filter);
  }

  async find({
    filter,
    sort,
    skip,
    limit,
  }: {
    filter: RootFilterQuery<Certificate>;
    sort?: { [key: string]: mongoose.SortOrder };
    skip?: number;
    limit?: number;
  }) {
    filter['isDeleted'] = false;
    return await this.certificateModel
      .find(filter)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20);
  }

  async findOne({ filter }: { filter: mongoose.RootFilterQuery<Certificate> }) {
    filter['isDeleted'] = false;
    return await this.certificateModel.findOne(filter);
  }

  async findOneAndUpdate({
    filter,
    update,
  }: {
    filter: mongoose.RootFilterQuery<Certificate>;
    update: mongoose.UpdateQuery<Certificate>;
  }) {
    filter['isDeleted'] = false;
    return await this.certificateModel.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
    });
  }

  async createCertificate(user: LoginDto, body: CreateCertificateBodyDto) {
    const { userId } = user;
    const {
      certType,
      title,
      score,
      scoreDetails,
      issuedDate,
      certHash,
      blockchainTxID,
      status,
      studentEmail,
      issuerID,
      issuerType,
      studentSignature,
      issuerSignature,
    } = body;

    const doc: Certificate = {
      certType,
      title,
      score,
      scoreDetails: scoreDetails || '',
      issuedDate: new Date(issuedDate),
      certHash,
      blockchainTxID,
      status,
      studentEmail,
      issuerID,
      issuerType,
      studentSignature,
      issuerSignature,
      createdBy: { userId, createdAt: new Date() },
    };
    return this.create({ doc });
  }

  async updateCertificate(
    user: LoginDto,
    param: UpdateCertificateParamDto,
    body: UpdateCertificateBodyDto,
  ) {
    const { userId } = user;
    const { id } = param;
    const {
      certType,
      title,
      score,
      scoreDetails,
      issuedDate,
      certHash,
      blockchainTxID,
      status,
      studentEmail,
      issuerID,
      issuerType,
      studentSignature,
      issuerSignature,
    } = body;

    // Filter out undefined fields and ensure type safety
    const updateFields: Partial<Certificate> = {};
    if (certType !== undefined) updateFields.certType = certType;
    if (title !== undefined) updateFields.title = title;
    if (score !== undefined) updateFields.score = score;
    if (scoreDetails !== undefined) updateFields.scoreDetails = scoreDetails;
    if (issuedDate !== undefined)
      updateFields.issuedDate = new Date(issuedDate);
    if (certHash !== undefined) updateFields.certHash = certHash;
    if (blockchainTxID !== undefined)
      updateFields.blockchainTxID = blockchainTxID;
    if (status !== undefined) updateFields.status = status;
    if (studentEmail !== undefined) updateFields.studentEmail = studentEmail;
    if (issuerID !== undefined) updateFields.issuerID = issuerID;
    if (issuerType !== undefined) updateFields.issuerType = issuerType;
    if (studentSignature !== undefined)
      updateFields.studentSignature = studentSignature;
    if (issuerSignature !== undefined)
      updateFields.issuerSignature = issuerSignature;

    const certificateExists = await this.findOneAndUpdate({
      filter: { _id: id },
      update: {
        $set: updateFields,
        $push: {
          updatedBy: { userId, updatedAt: new Date() },
        },
      },
    });
    if (!certificateExists) {
      throw new NotFoundException('Certificate id not found');
    }

    return certificateExists;
  }

  async deleteCertificate(user: LoginDto, param: DeleteCertificateParamDto) {
    const { userId } = user;
    const { id } = param;

    const certificateExists = await this.findOneAndUpdate({
      filter: { _id: id },
      update: { isDeleted: true, deletedBy: { userId, deletedAt: new Date() } },
    });
    if (!certificateExists) {
      throw new NotFoundException('Certificate id not found');
    }

    return {};
  }

  async findCertificates(query: FindCertificatesQueryDto) {
    const { filter, page, limit } = query;
    const filterOptions: {
      certType?: RegExp;
      title?: RegExp;
      status?: RegExp;
      studentEmail?: RegExp;
      issuerID?: RegExp;
      issuerType?: RegExp;
    } = {};
    let sort = {};
    const pagination = paginationHelper(page, limit);

    if (filter) {
      const {
        certType,
        title,
        status,
        studentEmail,
        issuerID,
        issuerType,
        sortBy,
        sortOrder,
      } = filter;

      if (certType) {
        filterOptions.certType = new RegExp(certType as string, 'i');
      }

      if (title) {
        filterOptions.title = new RegExp(title as string, 'i');
      }

      if (status) {
        filterOptions.status = new RegExp(status as string, 'i');
      }

      if (studentEmail) {
        filterOptions.studentEmail = new RegExp(studentEmail as string, 'i');
      }

      if (issuerID) {
        filterOptions.issuerID = new RegExp(issuerID as string, 'i');
      }

      if (issuerType) {
        filterOptions.issuerType = new RegExp(issuerType as string, 'i');
      }

      sort = sortHelper(sortBy as string, sortOrder as string);
    }

    const [total, certificates] = await Promise.all([
      this.countDocuments({ filter: filterOptions }),
      this.find({
        filter: filterOptions,
        sort,
        skip: pagination.skip,
        limit: pagination.limit,
      }),
    ]);
    return {
      certificates: {
        total,
        page,
        limit,
        items: certificates,
      },
    };
  }

  async findCertificateById(param: FindCertificateByIdParamDto) {
    const { id } = param;

    const certificateExists = await this.findOne({ filter: { _id: id } });
    if (!certificateExists) {
      throw new NotFoundException('Certificate id not found');
    }

    return certificateExists;
  }
}
