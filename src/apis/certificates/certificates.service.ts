import mongoose, { RootFilterQuery } from 'mongoose';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import sortHelper from 'src/helpers/sort.helper';
import paginationHelper from 'src/helpers/pagination.helper';

import { LoginDto } from '../auth/dto/login.dto';
import { UsersService } from '../users/users.service';

import {
  UpdateCertificateBodyDto,
  UpdateCertificateParamDto,
} from './dto/update-certificate.dto';
import { Certificate } from './schemas/certificate.schema';
import { FindCertificatesQueryDto } from './dto/find-certificates.dto';
import { CreateCertificateBodyDto } from './dto/create-certificate.dto';
import { DeleteCertificateParamDto } from './dto/delete-certificate.dto';
import { FindCertificateByIdParamDto } from './dto/find-certificate-by-id.dto';
import { Role } from '../roles/schemas/role.schema';
import { FindCertificateByCertificateHashParamDto } from './dto/find-certificate-by-certificate-hash.dto';
import { IssuingAgenciesService } from '../issuing-agencies/issuing-agencies.service';

@Injectable()
export class CertificatesService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(Certificate.name)
    private readonly certificateModel: mongoose.Model<Certificate>,
    private readonly usersService: UsersService,
    private readonly issuingAgenciesService: IssuingAgenciesService,
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

  async createCertificate(user: LoginDto, body: CreateCertificateBodyDto) {
    const { userId } = user;
    await this.checkPermissions({ userId, permission: 'create-certificate' });

    const { title, score, scoreDetails, issuedDate, studentEmail, issuerID } =
      body;

    const newCertificate = await this.create({
      doc: {
        title,
        score,
        scoreDetails: scoreDetails || '',
        issuedDate: new Date(issuedDate),
        status: 'pending',
        studentEmail,
        issuerID,
        certificateHash: 'n',
        createdBy: { userId, createdAt: new Date() },
      },
    });

    const certificateHash = this.jwtService.sign(
      { certificateId: newCertificate.id as string },
      { privateKey: this.configService.get<string>('ACCESS_TOKEN_SECRET') },
    );

    return this.findOneAndUpdate({
      filter: { _id: newCertificate.id },
      update: { certificateHash },
    });
  }

  async updateCertificate(
    user: LoginDto,
    param: UpdateCertificateParamDto,
    body: UpdateCertificateBodyDto,
  ) {
    const { userId } = user;
    await this.checkPermissions({ userId, permission: 'update-certificate' });

    const { id } = param;
    const { title, score, scoreDetails, issuedDate, studentEmail, issuerID } =
      body;

    // Filter out undefined fields and ensure type safety
    const updateFields: Partial<Certificate> = {};
    if (title !== undefined) updateFields.title = title;
    if (score !== undefined) updateFields.score = score;
    if (scoreDetails !== undefined) updateFields.scoreDetails = scoreDetails;
    if (issuedDate !== undefined)
      updateFields.issuedDate = new Date(issuedDate);
    if (studentEmail !== undefined) updateFields.studentEmail = studentEmail;
    if (issuerID !== undefined) updateFields.issuerID = issuerID;

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
    await this.checkPermissions({ userId, permission: 'delete-certificate' });

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
      title?: RegExp;
      status?: RegExp;
      studentEmail?: RegExp;
      issuerID?: RegExp;
    } = {};
    let sort = {};
    const pagination = paginationHelper(page, limit);

    if (filter) {
      const { title, status, studentEmail, issuerID, sortBy, sortOrder } =
        filter;

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

  // GET /v1/certificates/find/by/certificate-hash/:certificateHash
  async findCertificateByCertificateHash(
    user: LoginDto,
    param: FindCertificateByCertificateHashParamDto,
  ) {
    const { email } = user;
    const { certificateHash } = param;

    const certificateHashExists = await this.findOne({
      filter: { certificateHash, studentEmail: email },
    });
    if (!certificateHashExists) {
      throw new NotFoundException('Certificate hash not found');
    }

    const issuingAgencyExists = await this.issuingAgenciesService.findOne({
      filter: { _id: certificateHashExists.issuerID },
    });

    const result: any = certificateHashExists.toObject();
    result['issuingAgencyName'] = issuingAgencyExists?.name;

    return result;
  }
}
