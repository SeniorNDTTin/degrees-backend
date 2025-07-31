import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import mongoose, { PopulateOptions, RootFilterQuery } from 'mongoose';
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
import { Role } from '../roles/schemas/role.schema';

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => RolesService))
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
      .populate({ path: 'roleId', select: 'name permissions' })
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20);
  }

  async findOne({
    filter,
    populate,
  }: {
    filter: mongoose.RootFilterQuery<User>;
    populate?: PopulateOptions | (string | PopulateOptions)[];
  }) {
    filter['isDeleted'] = false;

    return await this.userModel.findOne(filter).populate(populate || []);
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

  async checkPermissions({
    userId,
    permission,
  }: {
    userId: string;
    permission: string;
  }) {
    const userExists = await this.findOne({
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

  // POST /v1/users/create
  async createUser(user: LoginDto, body: CreateUserBodyDto) {
    console.log('Creating user with data:', { ...body, password: '***' });
    
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'create-user',
    });

    const { fullName, email, password, birthday, gender, roleId } = body;

    // Validate required fields
    if (!fullName?.trim()) {
      throw new ForbiddenException('Tên không được để trống');
    }

    if (!email?.trim()) {
      throw new ForbiddenException('Email không được để trống');
    }

    if (!password?.trim()) {
      throw new ForbiddenException('Mật khẩu không được để trống');
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ForbiddenException('Email không hợp lệ');
    }

    // Validate password format (at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character)
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      throw new ForbiddenException('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt');
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.findOne({ 
      filter: { email: email.toLowerCase() }
    });
    if (existingUser) {
      throw new ForbiddenException('Email đã được sử dụng');
    }

    // Validate roleId
    if (!roleId) {
      throw new ForbiddenException('Vai trò không được để trống');
    }

    try {
      const roleExists = await this.rolesService.findOne({
        filter: { _id: roleId },
      });
      if (!roleExists) {
        throw new NotFoundException('Vai trò không tồn tại');
      }

      const hashedPassword = await this.hashPassword({ password });
      console.log('Role exists:', roleExists);

      // Validate birthday
      if (!birthday) {
        throw new ForbiddenException('Ngày sinh không được để trống');
      }

      // Validate gender
      if (!gender) {
        throw new ForbiddenException('Giới tính không được để trống');
      }

      // Convert birthday string to Date object
      let birthdayDate: Date;
      try {
        birthdayDate = new Date(birthday);
        if (isNaN(birthdayDate.getTime())) {
          throw new Error('Invalid date');
        }
      } catch (error) {
        throw new ForbiddenException('Ngày sinh không hợp lệ');
      }

      // Check if birthday is in the future
      if (birthdayDate > new Date()) {
        throw new ForbiddenException('Ngày sinh không thể là ngày trong tương lai');
      }

      const newUser = await this.create({
        doc: {
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          birthday: birthdayDate,
          gender,
          roleId: new mongoose.Types.ObjectId(roleId),
          createdBy: { userId, createdAt: new Date() },
          isDeleted: false,
        } as User,
      });

      console.log('User created successfully:', { ...newUser.toObject(), password: '***' });
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 11000) {
        throw new ForbiddenException('Email đã được sử dụng');
      }
      throw new ForbiddenException('Có lỗi xảy ra khi tạo người dùng');
    }
  }

  // PATCH /v1/users/update/:id
  async updateUser(
    user: LoginDto,
    param: UpdateUserParamDto,
    body: UpdateUserBodyDto,
  ): Promise<User> {
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'update-user',
    });

    const { id } = param;
    const { fullName, email, password, birthday, gender, roleId } = body;

    let hashedPassword: string | undefined = undefined;

    if (password) {
      hashedPassword = await this.hashPassword({ password });
    }

    // Kiểm tra roleId có tồn tại không
    if (roleId) {
      const roleExists = await this.rolesService.findOne({
        filter: { _id: roleId },
      });
      if (!roleExists) {
        throw new NotFoundException('Role id not found');
      }
    }

    await this.findOneAndUpdate({
      filter: { _id: id },
      update: {
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(birthday && { birthday }),
        ...(gender && { gender }),
        ...(roleId && { roleId: new mongoose.Types.ObjectId(roleId) }),
        ...(hashedPassword && { password: hashedPassword }),
        $push: {
          updatedBy: { userId, updatedAt: new Date() },
        },
      },
    });

    // Sau khi update, lấy lại user đã populate roleId
    const updatedUser = await this.findOne({ 
      filter: { _id: id }, 
      populate: [{ path: 'roleId', select: 'name permissions' }] 
    });
    if (!updatedUser) {
      throw new NotFoundException('User id not found');
    }

    return updatedUser;
  }

  // DELETE /v1/users/delete/:id
  async deleteUser(user: LoginDto, param: DeleteUserParamDto) {
    const { userId } = user;
    await this.checkPermissions({
      userId,
      permission: 'delete-user',
    });

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

    // Thêm populate: 'roleId' để lấy thông tin vai trò
        const userExists = await this.findOne({ 
      filter: { _id: id }, 
      populate: [{ path: 'roleId', select: 'name permissions' }] 
    }); 
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
