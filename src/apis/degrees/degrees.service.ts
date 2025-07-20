import mongoose, { RootFilterQuery } from 'mongoose';

import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Injectable, NotFoundException } from '@nestjs/common';

import sortHelper from 'src/helpers/sort.helper';
import paginationHelper from 'src/helpers/pagination.helper';

import { LoginDto } from '../auth/dto/login.dto';

import { Degree } from './schemas/degree.schema';
import { UpdateDegreeDto } from './dto/update-degree.dto';
import { FindDegreesQueryDto } from './dto/find-degrees.dto';
import { CreateDegreeBodyDto } from './dto/create-degree.dto';
import { DeleteDegreeParamDto } from './dto/delete-degree.dto';
import { FindDegreeByIdParamDto } from './dto/find-degree-by-id.dto';

@Injectable()
export class DegreesService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(Degree.name)
    private readonly degreeModel: mongoose.Model<Degree>,
  ) {}

  async create({ doc }: { doc: Partial<Degree> }) {
    const newDegree = new this.degreeModel(doc);
    return await newDegree.save();
  }

  async countDocuments({ filter }: { filter: RootFilterQuery<Degree> }) {
    filter['isDeleted'] = false;

    return await this.degreeModel.countDocuments(filter);
  }

  async find({
    filter,
    sort,
    skip,
    limit,
  }: {
    filter: RootFilterQuery<Degree>;
    sort?: { [key: string]: mongoose.SortOrder };
    skip?: number;
    limit?: number;
  }) {
    filter['isDeleted'] = false;

    return await this.degreeModel
      .find(filter)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20);
  }

  async findOne({ filter }: { filter: mongoose.RootFilterQuery<Degree> }) {
    filter['isDeleted'] = false;

    return await this.degreeModel.findOne(filter);
  }

  async findOneAndUpdate({
    filter,
    update,
  }: {
    filter: mongoose.RootFilterQuery<Degree>;
    update: mongoose.UpdateQuery<Degree>;
  }) {
    filter['isDeleted'] = false;

    return await this.degreeModel.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
    });
  }

  // POST /v1/degrees/create
  async createDegree(user: LoginDto, body: CreateDegreeBodyDto) {
    const { userId } = user;
    const {
      degreeName,
      major,
      GPA,
      classification,
      issuedDate,
      status,
      studentEmail,
      issuerID,
    } = body;

    const studentSignature = this.jwtService.sign(
      { userId },
      { privateKey: this.configService.get<string>('SIGNATURE_SECRET') },
    );
    const issuerSignature = this.jwtService.sign(
      { issuerID },
      { privateKey: this.configService.get<string>('SIGNATURE_SECRET') },
    );

    return this.create({
      doc: {
        degreeName,
        major,
        GPA,
        classification,
        issuedDate,
        status,
        studentEmail,
        issuerID,
        studentSignature,
        issuerSignature,
        createdBy: { userId, createdAt: new Date() },
      },
    });
  }

  async updateDegree(
    user: LoginDto,
    param: { id: string },
    body: UpdateDegreeDto,
  ) {
    const { userId } = user;
    const { id } = param;

    const degreeExists = await this.findOneAndUpdate({
      filter: { _id: id },
      update: {
        ...body,
        $push: {
          updatedBy: { userId, updatedAt: new Date() },
        },
      },
    });

    if (!degreeExists) {
      throw new NotFoundException('Degree id not found');
    }

    return degreeExists;
  }

  async deleteDegree(user: LoginDto, param: DeleteDegreeParamDto) {
    const { userId } = user;
    const { id } = param;

    const degreeExists = await this.findOneAndUpdate({
      filter: { _id: id },
      update: {
        isDeleted: true,
        deletedBy: { userId, deletedAt: new Date() },
      },
    });
    if (!degreeExists) {
      throw new NotFoundException('Degree id not found');
    }

    return {};
  }

  async findDegrees(query: FindDegreesQueryDto) {
    const { filter, page, limit } = query;
    const filterOptions: {
      name?: RegExp;
      description?: RegExp;
    } = {};
    let sort = {};
    const pagination = paginationHelper(page, limit);

    if (filter) {
      const { name, description, sortBy, sortOrder } = filter;

      if (name) {
        filterOptions.name = new RegExp(name as string, 'i');
      }

      if (description) {
        filterOptions.description = new RegExp(description as string, 'i');
      }

      sort = sortHelper(sortBy as string, sortOrder as string);
    }

    const [total, degrees] = await Promise.all([
      this.countDocuments({ filter: filterOptions }),
      this.find({
        filter: filterOptions,
        sort,
        skip: pagination.skip,
        limit: pagination.limit,
      }),
    ]);

    return {
      degrees: {
        total,
        page,
        limit,
        items: degrees,
      },
    };
  }

  async findDegreeById(param: FindDegreeByIdParamDto) {
    const { id } = param;

    const degreeExists = await this.findOne({ filter: { _id: id } });
    if (!degreeExists) {
      throw new NotFoundException('Degree id not found');
    }

    return degreeExists;
  }
}
