import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import mongoose, { RootFilterQuery } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';

import { User } from './schemas/user.schema';
import { CreateUserBodyDto } from './dto/create-user.dto';
import { DeleteUserParamDto } from './dto/delete-user.dto';
import { UpdateUserBodyDto, UpdateUserParamDto } from './dto/update-user.dto';

import { LoginDto } from '../auth/dto/login.dto';
import { RolesService } from '../roles/roles.service';
import { FindUserByIdParamDto } from './dto/find-user-by-id.dto';
import { FindUsersQueryDto } from './dto/find-users.dto';
import paginationHelper from 'src/helpers/pagination.helper';
import sortHelper from 'src/helpers/sort.helper';

@Injectable()
export class UsersService {
  constructor(
    private readonly rolesService: RolesService,
    @InjectModel(User.name) private readonly userModel: mongoose.Model<User>,
  ) {}

  async hashPassword({ password }: { password: string }) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async comparePassword({
    password,
    hashPassword,
  }: {
    password: string;
    hashPassword: string;
  }) {
    return await bcrypt.compare(password, hashPassword);
  }

  async create({ doc }: { doc: User }) {
    const newUser = new this.userModel(doc);
    return await newUser.save();
  }

  async countDocuments({ filter }: { filter: RootFilterQuery<User> }) {
    filter['isDeleted'] = false;

    return await this.userModel.countDocuments(filter);
  }

  async find({
    filter,
    sort,
    skip,
    limit,
  }: {
    filter: RootFilterQuery<User>;
    sort?: { [key: string]: mongoose.SortOrder };
    skip?: number;
    limit?: number;
  }) {
    filter['isDeleted'] = false;

    return await this.userModel
      .find(filter)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20);
  }

  async findOne({ filter }: { filter: mongoose.RootFilterQuery<User> }) {
    filter['isDeleted'] = false;

    return await this.userModel.findOne(filter);
  }

  async findOneAndUpdate({
    filter,
    update,
  }: {
    filter: mongoose.RootFilterQuery<User>;
    update: mongoose.UpdateQuery<User>;
  }) {
    filter['isDeleted'] = false;

    return await this.userModel.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
    });
  }

  async login({ email, password }: { email: string; password: string }) {
    const userExists = await this.userModel.findOne({
      email,
      isDeleted: false,
    });
    if (!userExists) {
      return { success: false };
    }

    const isPasswordMatch = await this.comparePassword({
      password,
      hashPassword: userExists.password,
    });
    if (!isPasswordMatch) {
      return { success: false };
    }

    return { success: true, userExists };
  }

  // POST /v1/users/create
  async createUser(user: LoginDto, body: CreateUserBodyDto) {
    const { userId } = user;
    const { fullName, email, password, birthday, gender, roleId } = body;

    const roleExists = await this.rolesService.findOne({
      filter: { _id: roleId },
    });
    if (!roleExists) {
      throw new NotFoundException('Role id not found');
    }

    return await this.create({
      doc: {
        fullName,
        email,
        password: await this.hashPassword({ password }),
        birthday,
        gender,
        createdBy: { userId, createdAt: new Date() },
      },
    });
  }

  // PATCH /v1/users/update/:id
  async updateUser(
    user: LoginDto,
    param: UpdateUserParamDto,
    body: UpdateUserBodyDto,
  ): Promise<User> {
    const { userId } = user;
    const { id } = param;
    const { fullName, email, password, birthday, gender, roleId } = body;

    let hashedPassword: string | undefined = undefined;

    if (password) {
      hashedPassword = await this.hashPassword({ password });
    }

    const usersExists = await this.findOneAndUpdate({
      filter: { _id: id },
      update: {
        fullName,
        email,
        birthday,
        gender,
        roleId,
        ...(hashedPassword && { password: hashedPassword }),
        $push: {
          updatedBy: { userId, updatedAt: new Date() },
        },
      },
    });

    console.log(body);

    if (!usersExists) {
      throw new NotFoundException('User id not found');
    }

    return usersExists;
  }

  // DELETE /v1/users/delete/:id
  async deleteUser(user: LoginDto, param: DeleteUserParamDto) {
    const { userId } = user;
    const { id } = param;

    const userExists = await this.findOneAndUpdate({
      filter: { _id: id },
      update: { isDeleted: true, deletedBy: { userId, deletedAt: new Date() } },
    });
    if (!userExists) {
      throw new NotFoundException('User id not found');
    }

    return {};
  }

  // GET /v1/users/find/:id
  async findUserById(param: FindUserByIdParamDto) {
    const { id } = param;

    const userExists = await this.findOne({ filter: { _id: id } });
    if (!userExists) {
      throw new NotFoundException('User id not found');
    }

    return userExists;
  }

  // GET /v1/users/find?filter?={fullName?, birthday?, gender?, roleId?, sortBy?, sortOrder?}&page?&limit?
  async findUsers(query: FindUsersQueryDto) {
    const { filter, page, limit } = query;
    const filterOptions: {
      fullName?: RegExp;
      birthday?: RegExp;
      gender?: RegExp;
      roleId?: RegExp;
    } = {};

    let sort = {};
    const pagination = paginationHelper(page, limit);

    if (filter) {
      const { fullName, birthday, gender, roleId, sortBy, sortOrder } = filter;

      if (fullName) {
        filterOptions.fullName = new RegExp(fullName as string, 'i');
      }
      if (birthday) {
        filterOptions.birthday = new RegExp(birthday as string, 'i');
      }
      if (gender) {
        filterOptions.gender = new RegExp(gender as string, 'i');
      }
      if (roleId) {
        filterOptions.roleId = new RegExp(roleId as string, 'i');
      }

      sort = sortHelper(sortBy as string, sortOrder as string);
    }

    const [total, users] = await Promise.all([
      this.countDocuments({ filter: filterOptions }),
      this.find({
        filter: filterOptions,
        sort,
        skip: pagination.skip,
        limit: pagination.limit,
      }),
    ]);
    return {
      users: {
        total,
        page,
        limit,
        items: users,
      },
    };
  }
}
