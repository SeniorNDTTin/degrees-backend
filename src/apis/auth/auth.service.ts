import mongoose, { Model } from 'mongoose';

import { JwtService } from '@nestjs/jwt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import sendMailHelper from 'src/helpers/sendMail.helper';

import { UsersService } from '../users/users.service';

import { LoginDto } from './dto/login.dto';
import { Auth } from './schemas/auth.schema';
import { InjectModel } from '@nestjs/mongoose';
import generateOTPHelper from 'src/helpers/generateOTP.helper';
import { ValidateOTPBodyDto } from './dto/validateOTP.dto';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    @InjectModel(Auth.name) private readonly authModel: Model<Auth>,
  ) {}

  async create({ doc }: { doc: Auth }) {
    const newAuth = new this.authModel(doc);
    return await newAuth.save();
  }

  async findOneAndDelete({
    filter,
  }: {
    filter: mongoose.RootFilterQuery<Auth>;
  }) {
    return await this.authModel.findOneAndDelete(filter);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const validateResult = await this.usersService.login({ email, password });
    if (!validateResult.success) {
      return null;
    }

    return validateResult.userExists?.id;
  }

  // POST /v1/auth/login
  async login(user: LoginDto) {
    const { userId } = user;

    const userExists = await this.usersService.findOne({
      filter: { _id: userId },
    });

    const otp = generateOTPHelper({ length: 6 });
    // const otp = '123456';

    sendMailHelper({
      email: userExists?.email as string,
      subject: 'Mã OTP Xác Thực Đăng Nhập',
      html: `<h1>${otp}</h1>`,
    });
    await this.create({
      doc: { userId: new mongoose.Types.ObjectId(userId), otp },
    });

    return {
      userId,
    };
  }

  // POST /v1/auth/login/validate-otp
  async validateOTP(body: ValidateOTPBodyDto) {
    const { userId, otp } = body;

    const authExists = await this.findOneAndDelete({ filter: { userId, otp } });
    if (!authExists) {
      throw new NotFoundException('OTP was wrong or expires');
    }

    return {
      access_token: this.jwtService.sign(
        { userId },
        {
          privateKey: this.configService.get<string>('ACCESS_TOKEN_SECRET', ''),
          expiresIn: this.configService.get<string>(
            'ACCESS_TOKEN_EXPIRES_IN',
            '1d',
          ),
        },
      ),
    };
  }

  // GET /v1/auth/google/redirect
  googleAuthRedirect(req: Request, res: Response) {
    const { email } = req.user as { email: string };

    const accessToken = this.jwtService.sign(
      { email },
      {
        privateKey: this.configService.get<string>('ACCESS_TOKEN_SECRET', ''),
        expiresIn: this.configService.get<string>(
          'ACCESS_TOKEN_EXPIRES_IN',
          '1d',
        ),
      },
    );

    res.redirect(
      `http://localhost:5173/client-login?accessToken=${accessToken}`,
    );
  }
}
