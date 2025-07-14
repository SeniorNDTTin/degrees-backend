import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { LoginDto } from '../auth/dto/login.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

import { UsersService } from './users.service';
import { User } from './decorators/user.decorator';
import { CreateUserBodyDto } from './dto/create-user.dto';

@Controller({
  path: '/users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createUser(@User() user: LoginDto, @Body() body: CreateUserBodyDto) {
    return await this.usersService.createUser(user, body);
  }
}
