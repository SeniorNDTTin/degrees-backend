import { Request } from 'express';

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { ValidateOTPBodyDto } from './dto/validateOTP.dto';

@Controller({
  path: '/auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UseGuards(LocalAuthGuard)
  login(@Req() req: Request) {
    return this.authService.login(req.user as LoginDto);
  }

  @Post('/login/validate-otp')
  async validateOTP(@Body() body: ValidateOTPBodyDto) {
    return await this.authService.validateOTP(body);
  }

  @Get('/check-access-token')
  @UseGuards(JwtAuthGuard)
  checkAccessToken() {
    return { success: true };
  }
}
