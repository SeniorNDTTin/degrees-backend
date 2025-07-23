import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { RootFilterQuery } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import sortHelper from 'src/helpers/sort.helper';
import paginationHelper from 'src/helpers/pagination.helper';

import { LoginDto } from '../auth/dto/login.dto';
import { IssuingAgency, IssuingAgencyDocument } from './schemas/issuing-agency.schema';
import { CreateIssuingAgencyBodyDto } from './dto/create-issuing-agency.dto';
import { DeleteIssuingAgencyParamDto } from './dto/delete-issuing-agency.dto';
import { FindIssuingAgenciesQueryDto } from './dto/find-issuing-agencies.dto';
import { FindIssuingAgencyByIdParamDto } from './dto/find-issuing-agency-by-id.dto';
import { UpdateIssuingAgencyBodyDto, UpdateIssuingAgencyParamDto } from './dto/update-issuing-agency.dto';

@Injectable()
export class IssuingAgenciesService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(IssuingAgency.name)
    private readonly model: mongoose.Model<IssuingAgencyDocument>,
  ) {}

  async create({ doc }: { doc: IssuingAgency }) {
    return new this.model(doc).save();
  }

  async countDocuments({ filter }: { filter: RootFilterQuery<IssuingAgency> }) {
    filter['isDeleted'] = false;
    return this.model.countDocuments(filter);
  }

  async find({
    filter,
    sort = {},
    skip = 0,
    limit = 20,
  }: {
    filter: mongoose.FilterQuery<IssuingAgency>;
    sort?: { [key: string]: mongoose.SortOrder };
    skip?: number;
    limit?: number;
  }) {
    filter.isDeleted = false;
    return this.model.find(filter).sort(sort).skip(skip).limit(limit).lean();
  }

  async findOne({ filter }: { filter: RootFilterQuery<IssuingAgency> }) {
    filter['isDeleted'] = false;
    return this.model.findOne(filter).lean();
  }

  async findOneAndUpdate({
    filter,
    update,
    options = {},
  }: {
    filter: RootFilterQuery<IssuingAgency>;
    update: mongoose.UpdateQuery<IssuingAgency>;
    options?: mongoose.QueryOptions;
  }) {
    filter['isDeleted'] = false;
    return this.model.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  async createIssuingAgency(user: LoginDto, body: CreateIssuingAgencyBodyDto) {
    const doc: any = {
      ...body,
      isDeleted: false,
      createdBy: { userId: user.userId, createdAt: new Date() },
    };

    const newIssuingAgency = await this.create({ doc: doc as IssuingAgency });

    const publicKey = this.jwtService.sign(
      { issuingAgencyId: newIssuingAgency.id as string },
      { privateKey: this.configService.get<string>('SIGNATURE_SECRET') },
    );

    return this.findOneAndUpdate({
      filter: { _id: newIssuingAgency.id },
      update: { publicKey },
    });
  }

  async updateIssuingAgency(
    user: LoginDto,
    param: UpdateIssuingAgencyParamDto,
    body: UpdateIssuingAgencyBodyDto,
  ) {
    const updated = await this.findOneAndUpdate({
      filter: { _id: param.id },
      update: {
        ...body,
        $push: {
          updatedBy: { userId: user.userId, updatedAt: new Date() },
        },
      },
    });

    if (!updated) throw new NotFoundException('Issuing Agency not found');

    return updated;
  }

  async deleteIssuingAgency(user: LoginDto, param: DeleteIssuingAgencyParamDto) {
    const deleted = await this.findOneAndUpdate({
      filter: { _id: param.id },
      update: {
        isDeleted: true,
        deletedBy: { userId: user.userId, deletedAt: new Date() },
      },
    });

    if (!deleted) throw new NotFoundException('Issuing Agency not found');

    return {};
  }

  async findIssuingAgencies(query: FindIssuingAgenciesQueryDto) {
    const { filter, page = 1, limit = 20 } = query;
    const filterOptions: any = {};
    const pagination = paginationHelper(page, limit);
    let sort = {};

    if (filter) {
      try {
        const filterData = typeof filter === 'string' ? JSON.parse(filter) : filter;
        const { name, email, location, isUniversity, sortBy, sortOrder } = filterData;

        if (name) filterOptions.name = new RegExp(String(name), 'i');
        if (email) filterOptions.email = new RegExp(String(email), 'i');
        if (location) filterOptions.location = new RegExp(String(location), 'i');
        if (typeof isUniversity !== 'undefined') {
          filterOptions.isUniversity = isUniversity === true || String(isUniversity).toLowerCase() === 'true';
        }

        sort = sortHelper(sortBy, sortOrder);
      } catch (error) {
        console.error('Error parsing filter:', error);
      }
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
      data: {
        issuingAgencies: {
          items: items.map(item => ({
            ...item,
            _id: item._id.toString()
          })),
          total,
          page,
          limit
        }
      },
      message: 'Success',
      statusCode: 200
    };
  }

  async findIssuingAgencyById(param: FindIssuingAgencyByIdParamDto) {
    const found = await this.findOne({ filter: { _id: param.id } });
    if (!found) throw new NotFoundException('Issuing Agency not found');
    return found;
  }
}
