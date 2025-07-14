import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';

import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const validateResult = await this.usersService.login({ email, password });
    if (!validateResult.success) {
      return null;
    }

    return validateResult.userExists?.id;
  }

  // POST /v1/auth/login
  login(user: LoginDto) {
    const payload = { userId: user.userId };
    return {
      access_token: this.jwtService.sign(payload, {
        privateKey: this.configService.get<string>('ACCESS_TOKEN_SECRET', ''),
        expiresIn: this.configService.get<string>(
          'ACCESS_TOKEN_EXPIRES_IN',
          '1d',
        ),
      }),
    };
  }
}
