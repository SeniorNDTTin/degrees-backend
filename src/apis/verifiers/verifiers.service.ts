import mongoose from 'mongoose';

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import sortHelper from 'src/helpers/sort.helper';
import paginationHelper from 'src/helpers/pagination.helper';

import { LoginDto } from '../auth/dto/login.dto';

import {
  UpdateVerifierBodyDto,
  UpdateVerifierParamDto,
} from './dto/update-verifier.dto';
import { Verifier } from './schemas/verifier.schema';
import { CreateVerifierBodyDto } from './dto/create-verfier.dto';
import { FindVerifiersQueryDto } from './dto/find-verifiers.dto';
import { DeleteVerifierParamDto } from './dto/delete-verifier.dto';
import { FindVerifierByIdParamDto } from './dto/find-verifier-by-id.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../roles/schemas/role.schema';

@Injectable()
export class VerifiersService {
  constructor(
    @InjectModel(Verifier.name)
    private readonly verifierModel: mongoose.Model<Verifier>,
    private readonly usersService: UsersService,
  ) {}

  async create({ doc }: { doc: Verifier }) {
    const newVerifier = new this.verifierModel(doc);
    return await newVerifier.save();
  }

  async countDocuments({
    filter,
  }: {
    filter: mongoose.RootFilterQuery<Verifier>;
  }) {
    filter['isDeleted'] = false;

    return await this.verifierModel.countDocuments(filter);
  }

  async find({
    filter,
    sort,
    skip,
    limit,
  }: {
    filter: mongoose.RootFilterQuery<Verifier>;
    sort?: { [key: string]: mongoose.SortOrder };
    skip?: number;
    limit?: number;
  }) {
    filter['isDeleted'] = false;

    return await this.verifierModel
      .find(filter)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20);
  }

  async findOne({ filter }: { filter: mongoose.RootFilterQuery<Verifier> }) {
    filter['isDeleted'] = false;

    return await this.verifierModel.findOne(filter);
  }

  async findOneAndUpdate({
    filter,
    update,
  }: {
    filter: mongoose.RootFilterQuery<Verifier>;
    update: mongoose.UpdateQuery<Verifier>;
  }) {
    filter['isDeleted'] = false;

    return await this.verifierModel.findOneAndUpdate(filter, update);
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

  // POST /v1/verifiers/create
  async createVerifier(user: LoginDto, body: CreateVerifierBodyDto) {
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'create-verififier',
    });

    const { verifierName, organization, verifierEmail } = body;

    return await this.create({
      doc: {
        verifierName,
        organization,
        verifierEmail,
        createdBy: { userId, createdAt: new Date() },
      },
    });
  }

  // PATCH /v1/verifier/update/:id
  async updateVerifier(
    user: LoginDto,
    param: UpdateVerifierParamDto,
    body: UpdateVerifierBodyDto,
  ) {
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'update-verififier',
    });

    const { id } = param;
    const { verifierName, organization, verifierEmail } = body;

    const verifierExists = await this.findOneAndUpdate({
      filter: { _id: id },
      update: {
        verifierName,
        organization,
        verifierEmail,
        $push: { updatedBy: { userId, updatedAt: new Date() } },
      },
    });
    if (!verifierExists) {
      throw new NotFoundException('Verifier id not found');
    }

    return verifierExists;
  }

  // DELETE /v1/verifier/delete/:id
  async deleteVerifier(user: LoginDto, param: DeleteVerifierParamDto) {
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'delete-verififier',
    });

    const { id } = param;

    const verifierExists = await this.findOneAndUpdate({
      filter: { _id: id },
      update: { isDeleted: true, deletedBy: { userId, deletedAt: new Date() } },
    });
    if (!verifierExists) {
      throw new NotFoundException('Verifier id not found');
    }

    return {};
  }

  // GET /v1/verifiers/find?filter?={verifierName?, organization?, verifierEmail?, sortBy?, sortOrder?}&page?&limit?
  async findVerifiers(query: FindVerifiersQueryDto) {
    const { filter, page, limit } = query;
    const filterOptions: {
      verifierName?: RegExp;
      organization?: RegExp;
      verifierEmail?: RegExp;
    } = {};
    let sort = {};
    const pagination = paginationHelper(page, limit);

    if (filter) {
      const { verifierName, organization, verifierEmail, sortBy, sortOrder } =
        filter;

      if (verifierName) {
        filterOptions.verifierName = new RegExp(verifierName as string, 'i');
      }

      if (organization) {
        filterOptions.organization = new RegExp(organization as string, 'i');
      }

      if (verifierEmail) {
        filterOptions.verifierEmail = new RegExp(verifierEmail as string, 'i');
      }

      sort = sortHelper(sortBy as string, sortOrder as string);
    }

    const [total, verifiers] = await Promise.all([
      this.countDocuments({ filter: filterOptions }),
      this.find({
        filter: filterOptions,
        sort,
        skip: pagination.skip,
        limit: pagination.limit,
      }),
    ]);
    return {
      verifiers: {
        total,
        page,
        limit,
        items: verifiers,
      },
    };
  }

  // GET /v1/verifiers/find/:id
  async findVerifierById(param: FindVerifierByIdParamDto) {
    const { id } = param;

    const verifierExists = await this.findOne({ filter: { _id: id } });
    if (!verifierExists) {
      throw new NotFoundException('Verifier id not found');
    }

    return verifierExists;
  }
}
