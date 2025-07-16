import { Request } from 'express';

import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

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

  @Get('/check-access-token')
  @UseGuards(JwtAuthGuard)
  checkAccessToken() {
    return { success: true };
  }
}
