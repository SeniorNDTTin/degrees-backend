import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { plainToInstance } from 'class-transformer';

import { UsersService } from './users.service';
import { ViewUserDto } from './dto/view-user.dto';
import { User } from './decorators/user.decorator';
import { CreateUserBodyDto } from './dto/create-user.dto';
import { DeleteUserParamDto } from './dto/delete-user.dto';
import { UpdateUserBodyDto, UpdateUserParamDto } from './dto/update-user.dto';

import { LoginDto } from '../auth/dto/login.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return plainToInstance(ViewUserDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
