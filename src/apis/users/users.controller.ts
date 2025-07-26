import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { User } from './decorators/user.decorator';
import { CreateUserBodyDto } from './dto/create-user.dto';
import { DeleteUserParamDto } from './dto/delete-user.dto';
import { UpdateUserBodyDto, UpdateUserParamDto } from './dto/update-user.dto';

import { LoginDto } from '../auth/dto/login.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { FindUsersQueryDto } from './dto/find-users.dto';
import { FindUserByIdParamDto } from './dto/find-user-by-id.dto';

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

  @Patch('/update/:id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @User() user: LoginDto,
    @Param() param: UpdateUserParamDto,
    @Body() body: UpdateUserBodyDto,
  ) {
    return await this.usersService.updateUser(user, param, body);
  }

  @Delete('/delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@User() user: LoginDto, @Param() param: DeleteUserParamDto) {
    return await this.usersService.deleteUser(user, param);
  }

  @Get('/find')
  @UseGuards(JwtAuthGuard)
  async findUsers(@Query() query: FindUsersQueryDto) {
    return await this.usersService.findUsers(query);
  }

  @Get('/find/:id')
  @UseGuards(JwtAuthGuard)
  async findUserById(@Param() param: FindUserByIdParamDto) {
    return await this.usersService.findUserById(param);
  }
}
