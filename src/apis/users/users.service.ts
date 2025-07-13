import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User } from './schemas/user.schema';
import { CreateUserBodyDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: mongoose.Model<User>,
  ) {}

  async hashPassword({ password }: { password: string }) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async create({ doc }: { doc: User }) {
    const newUser = new this.userModel(doc);
    return await newUser.save();
  }

  // POST /v1/users/create
  async createUser(body: CreateUserBodyDto) {
    const { fullName, email, password, birthday, gender } = body;

    return await this.create({
      doc: {
        fullName,
        email,
        password: await this.hashPassword({ password }),
        birthday,
        gender,
        createdBy: { userId: '', createdAt: new Date() },
      },
    });
  }
}
