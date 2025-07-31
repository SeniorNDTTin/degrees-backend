import mongoose, { RootFilterQuery } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import sortHelper from 'src/helpers/sort.helper';
import paginationHelper from 'src/helpers/pagination.helper';

import { LoginDto } from '../auth/dto/login.dto';

import { Role } from './schemas/role.schema';
import { FindROlesQueryDto } from './dto/find-roles.dto';
import { CreateRoleBodyDto } from './dto/create-role.dto';
import { DeleteRoleParamDto } from './dto/delete-role.dto';
import { FindRoleByIdParamDto } from './dto/find-role-by-id.dto';
import { UpdateRoleBodyDto, UpdateRoleParamDto } from './dto/update-role.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class RolesService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @InjectModel(Role.name) private readonly roleModel: mongoose.Model<Role>,
  ) {}

  async create({ doc }: { doc: Role }) {
    const newRole = new this.roleModel(doc);
    return await newRole.save();
  }

  async countDocuments({ filter }: { filter: RootFilterQuery<Role> }) {
    filter['isDeleted'] = false;

    return await this.roleModel.countDocuments(filter);
  }

  async find({
    filter,
    sort,
    skip,
    limit,
  }: {
    filter: RootFilterQuery<Role>;
    sort?: { [key: string]: mongoose.SortOrder };
    skip?: number;
    limit?: number;
  }) {
    filter['isDeleted'] = false;

    return await this.roleModel
      .find(filter)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20);
  }

  async findOne({ filter }: { filter: mongoose.RootFilterQuery<Role> }) {
    filter['isDeleted'] = false;

    return await this.roleModel.findOne(filter);
  }

  async findOneAndUpdate({
    filter,
    update,
  }: {
    filter: mongoose.RootFilterQuery<Role>;
    update: mongoose.UpdateQuery<Role>;
  }) {
    filter['isDeleted'] = false;

    return await this.roleModel.findOneAndUpdate(filter, update, {
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

  // POST /v1/roles/create
  async createRole(user: LoginDto, body: CreateRoleBodyDto) {
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'create-role',
    });

    const { name, description, permissions } = body;

    return this.create({
      doc: {
        name,
        description,
        permissions,
        createdBy: { userId, createdAt: new Date() },
      },
    });
  }

  // PATCH /v1/roles/update/:id
  async updateRole(
    user: LoginDto,
    param: UpdateRoleParamDto,
    body: UpdateRoleBodyDto,
  ) {
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'update-role',
    });

    const { id } = param;
    const { name, description, permissions } = body;

    const rolesExists = await this.findOneAndUpdate({
      filter: { _id: id },
      update: {
        name,
        description,
        permissions,
        $push: {
          updatedBy: { userId, updatedAt: new Date() },
        },
      },
    });
    if (!rolesExists) {
      throw new NotFoundException('Role id not found');
    }

    return rolesExists;
  }

  // DELETE /v1/roles/delete/:id
  async deleteRole(user: LoginDto, param: DeleteRoleParamDto) {
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'delete-role',
    });

    const { id } = param;

    const roleExists = await this.findOneAndUpdate({
      filter: { _id: id },
      update: { isDeleted: true, deletedBy: { userId, deletedAt: new Date() } },
    });
    if (!roleExists) {
      throw new NotFoundException('Role id not found');
    }

    return {};
  }

  // GET /v1/roles/find?filter?={name?, description?, sortBy?, sortOrder?}&page?&limit?
  async findRoles(query: FindROlesQueryDto) {
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

    const [total, roles] = await Promise.all([
      this.countDocuments({ filter: filterOptions }),
      this.find({
        filter: filterOptions,
        sort,
        skip: pagination.skip,
        limit: pagination.limit,
      }),
    ]);
    return {
      roles: {
        total,
        page,
        limit,
        items: roles,
      },
    };
  }

  // GET /v1/roles/find/:id
  async findRoleById(param: FindRoleByIdParamDto) {
    const { id } = param;

    const roleExists = await this.findOne({ filter: { _id: id } });
    if (!roleExists) {
      throw new NotFoundException('Role id not found');
    }

    return roleExists;
  }
}
