import { Body, Controller, Post } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserBodyDto } from './dto/create-user.dto';

@Controller({
  path: '/users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  async createUser(@Body() body: CreateUserBodyDto) {
    return await this.usersService.createUser(body);
  }
}
