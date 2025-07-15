import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { LoginDto } from '../auth/dto/login.dto';
import { RolesService } from '../roles/roles.service';

import { User } from './schemas/user.schema';
import { CreateUserBodyDto } from './dto/create-user.dto';

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
}
