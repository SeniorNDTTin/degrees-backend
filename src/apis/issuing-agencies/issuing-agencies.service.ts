import mongoose, { Promise, RootFilterQuery } from 'mongoose';

import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import sortHelper from 'src/helpers/sort.helper';
import paginationHelper from 'src/helpers/pagination.helper';

import { LoginDto } from '../auth/dto/login.dto';

import {
  IssuingAgency,
  IssuingAgencyDocument,
} from './schemas/issuing-agency.schema';
import {
  UpdateIssuingAgencyBodyDto,
  UpdateIssuingAgencyParamDto,
} from './dto/update-issuing-agency.dto';
import { CreateIssuingAgencyBodyDto } from './dto/create-issuing-agency.dto';
import { DeleteIssuingAgencyParamDto } from './dto/delete-issuing-agency.dto';
import { FindIssuingAgenciesQueryDto } from './dto/find-issuing-agencies.dto';
import { FindIssuingAgencyByIdParamDto } from './dto/find-issuing-agency-by-id.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../roles/schemas/role.schema';

@Injectable()
export class IssuingAgenciesService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    @InjectModel(IssuingAgency.name)
    private readonly issuingAgencyModel: mongoose.Model<IssuingAgencyDocument>,
  ) {}

  async create({ doc }: { doc: IssuingAgency }) {
    const newIssuingAgency = new this.issuingAgencyModel(doc);
    return await newIssuingAgency.save();
  }

  async countDocuments({ filter }: { filter: RootFilterQuery<IssuingAgency> }) {
    filter['isDeleted'] = false;

    return await this.issuingAgencyModel.countDocuments(filter);
  }

  async find({
    filter,
    sort,
    skip,
    limit,
  }: {
    filter: RootFilterQuery<IssuingAgency>;
    sort?: { [key: string]: mongoose.SortOrder };
    skip?: number;
    limit?: number;
  }) {
    filter['isDeleted'] = false;

    return await this.issuingAgencyModel
      .find(filter)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20);
  }

  async findOne({
    filter,
  }: {
    filter: mongoose.RootFilterQuery<IssuingAgency>;
  }) {
    filter['isDeleted'] = false;
    return await this.issuingAgencyModel.findOne(filter);
  }

  async findOneAndUpdate({
    filter,
    update,
  }: {
    filter: mongoose.RootFilterQuery<IssuingAgency>;
    update: mongoose.UpdateQuery<IssuingAgency>;
  }) {
    filter['isDeleted'] = false;

    return await this.issuingAgencyModel.findOneAndUpdate(filter, update, {
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

  // POST /v1/issuing-agency/create
  async createIssuingAgency(user: LoginDto, body: CreateIssuingAgencyBodyDto) {
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'create-issuing-agency',
    });

    const { name, email, location, isUniversity } = body;

    const newIssuingAgency = await this.create({
      doc: {
        name,
        email,
        location,
        isUniversity,
        createdBy: { userId, createdAt: new Date() },
      },
    });

    const publicKey = this.jwtService.sign(
      { issuingAgencyId: newIssuingAgency.id as string },
      { privateKey: this.configService.get<string>('SIGNATURE_SECRET') },
    );

    return await this.findOneAndUpdate({
      filter: { _id: newIssuingAgency.id },
      update: { publicKey },
    });
  }

  // PATH /v1/issuing-agency/update/:id
  async updateIssuingAgency(
    user: LoginDto,
    param: UpdateIssuingAgencyParamDto,
    body: UpdateIssuingAgencyBodyDto,
  ) {
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'update-issuing-agency',
    });

    const { id } = param;
    const { name, email, location, isUniversity } = body;

    const issuingAgencyExists = await this.findOneAndUpdate({
      filter: { _id: id },
      update: {
        name,
        email,
        location,
        isUniversity,
        $push: {
          updatedBy: { userId, updateAt: new Date() },
        },
      },
    });
    if (!issuingAgencyExists) {
      throw new NotFoundException('Issuing Agency id not found');
    }

    return issuingAgencyExists;
  }

  // DELETE  /v1/issuing-agency/delete/:id
  async deleteIssuingAgency(
    user: LoginDto,
    param: DeleteIssuingAgencyParamDto,
  ) {
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'delete-issuing-agency',
    });

    const { id } = param;

    const issuingAgencyExists = await this.findOneAndUpdate({
      filter: { _id: id },
      update: { isDeleted: true, deletedBy: { userId, deleteAt: new Date() } },
    });
    if (!issuingAgencyExists) {
      throw new NotFoundException('Issuing Agency id not found');
    }

    return {};
  }

  // GET /vi/issuing-agencies/find?filter?={name?, email?, location?, publicKey?, isUniversity?, sortBy?, sortOrder?}&page?&limit?
  async findIssuingAgencies(query: FindIssuingAgenciesQueryDto) {
    const { filter, page, limit } = query;
    const filterOptions: {
      name?: RegExp;
      email?: RegExp;
      location?: RegExp;
      isUniversity?: boolean;
    } = {};
    let sort = {};
    const pagination = paginationHelper(page, limit);

    if (filter) {
      const { name, email, location, isUniversity, sortBy, sortOrder } = filter;

      if (name) filterOptions.name = new RegExp(name as string, 'i');
      if (email) filterOptions.email = new RegExp(email as string, 'i');
      if (location)
        filterOptions.location = new RegExp(location as string, 'i');
      if (isUniversity !== undefined) {
        filterOptions.isUniversity = isUniversity === 'true';
      }

      sort = sortHelper(sortBy as string, sortOrder as string);
    }

    const total = await this.issuingAgencyModel.countDocuments(filterOptions);
    const issuingAgencies = await this.issuingAgencyModel
      .find(filterOptions)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);

    return {
      issuingAgencies: {
        total,
        page,
        limit,
        items: issuingAgencies,
      },
    };
  }

  // GET /v1/issuing-agency/find/:id
  async findIssuingAgencyById(param: FindIssuingAgencyByIdParamDto) {
    const { id } = param;

    const issuingAgencyExists = await this.findOne({ filter: { _id: id } });
    if (!issuingAgencyExists) {
      throw new NotFoundException('Issuing Agency id not found');
    }

    return issuingAgencyExists;
  }
}
