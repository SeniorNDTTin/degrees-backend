import mongoose, { RootFilterQuery } from 'mongoose';

import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import sortHelper from 'src/helpers/sort.helper';
import paginationHelper from 'src/helpers/pagination.helper';

import { LoginDto } from '../auth/dto/login.dto';
import { Role } from '../roles/schemas/role.schema';
import { UsersService } from '../users/users.service';

import { Degree } from './schemas/degree.schema';
import { UpdateDegreeDto } from './dto/update-degree.dto';
import { FindDegreesQueryDto } from './dto/find-degrees.dto';
import { CreateDegreeBodyDto } from './dto/create-degree.dto';
import { DeleteDegreeParamDto } from './dto/delete-degree.dto';
import { FindDegreeByIdParamDto } from './dto/find-degree-by-id.dto';
import { FindDegreeByDegreeHashParamDto } from './dto/find-degree-by-degree-hash.dto';
import { IssuingAgenciesService } from '../issuing-agencies/issuing-agencies.service';
import { BlocksService } from '../blocks/blocks.service';
import { Verification } from '../verification/schemas/verification.schema';

@Injectable()
export class DegreesService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    @InjectModel(Degree.name)
    private readonly degreeModel: mongoose.Model<Degree>,
    private readonly issuingAgenciesService: IssuingAgenciesService,
    private readonly blocksService: BlocksService,

    @InjectModel(Verification.name)
    private readonly verificationModel: mongoose.Model<Verification>,
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

  // POST /v1/degrees/create
  async createDegree(user: LoginDto, body: CreateDegreeBodyDto) {
    const { userId } = user;
    await this.checkPermissions({ userId, permission: 'create-degree' });

    const {
      degreeName,
      major,
      GPA,
      classification,
      issuedDate,
      studentEmail,
      issuerID,
    } = body;

    const newDegree = await this.create({
      doc: {
        degreeName,
        major,
        GPA,
        classification,
        issuedDate,
        status: 'pending',
        studentEmail,
        issuerID,
        degreeHash: 'n',
        createdBy: { userId, createdAt: new Date() },
      },
    });

    const degreeHash = this.jwtService.sign(
      { degreeId: newDegree.id as string },
      { privateKey: this.configService.get<string>('ACCESS_TOKEN_SECRET') },
    );

    return await this.findOneAndUpdate({
      filter: { _id: newDegree.id },
      update: { degreeHash },
    });
  }

  async updateDegree(
    user: LoginDto,
    param: { id: string },
    body: UpdateDegreeDto,
  ) {
    const { userId } = user;
    await this.checkPermissions({ userId, permission: 'update-degree' });

    const { id } = param;

    const degreeExists = await this.findOne({ filter: { _id: id } });
    if (!degreeExists) {
      throw new NotFoundException('Degree id not found');
    }

    const degreeHash = this.jwtService.sign(
      { degreeId: id },
      { privateKey: this.configService.get<string>('ACCESS_TOKEN_SECRET') },
    );

    const newDegree = await this.findOneAndUpdate({
      filter: { _id: id },
      update: {
        ...body,
        degreeHash,
        $push: {
          updatedBy: { userId, updatedAt: new Date() },
        },
      },
    });

    const index = await this.blocksService.getNextBlockIndex();
    await this.blocksService.create({
      doc: {
        index,
        previousHash: degreeExists.degreeHash,
        currentHash: degreeHash,
        data: { collection: 'degrees', collectionId: id, userId },
      },
    });

    return newDegree;
  }

  async deleteDegree(user: LoginDto, param: DeleteDegreeParamDto) {
    const { userId } = user;
    await this.checkPermissions({ userId, permission: 'delete-degree' });

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

  // GET /v1/degrees/find/by/degree-hash/:degreeHash
  async findDegreeByDegreeHash(
    user: LoginDto,
    param: FindDegreeByDegreeHashParamDto,
  ) {
    const { email } = user;
    const { degreeHash } = param;

    const degreeExists = await this.findOne({
      filter: { degreeHash, studentEmail: email },
    });
    if (!degreeExists) {
      throw new NotFoundException('Degree hash not found');
    }

    const issuingAgencyExists = await this.issuingAgenciesService.findOne({
      filter: { _id: degreeExists.issuerID },
    });
    console.log(issuingAgencyExists);

    const result: any = degreeExists.toObject();
    result['issuingAgencyName'] = issuingAgencyExists?.name;

    return result;
  }
}
