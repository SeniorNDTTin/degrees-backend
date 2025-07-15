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

import { LoginDto } from '../auth/dto/login.dto';
import { User } from '../users/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

import { RolesService } from './roles.service';
import { FindROlesQueryDto } from './dto/find-roles.dto';
import { CreateRoleBodyDto } from './dto/create-role.dto';
import { DeleteRoleParamDto } from './dto/delete-role.dto';
import { FindRoleByIdParamDto } from './dto/find-role-by-id.dto';
import { UpdateRoleBodyDto, UpdateRoleParamDto } from './dto/update-role.dto';

@Controller({
  path: '/roles',
  version: '1',
})
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createRole(@User() user: LoginDto, @Body() body: CreateRoleBodyDto) {
    return await this.rolesService.createRole(user, body);
  }

  @Patch('/update/:id')
  @UseGuards(JwtAuthGuard)
  async updateRole(
    @User() user: LoginDto,
    @Param() param: UpdateRoleParamDto,
    @Body() body: UpdateRoleBodyDto,
  ) {
    return await this.rolesService.updateRole(user, param, body);
  }

  @Delete('/delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteRole(@User() user: LoginDto, @Param() param: DeleteRoleParamDto) {
    return await this.rolesService.deleteRole(user, param);
  }

  @Get('/find')
  @UseGuards(JwtAuthGuard)
  async findRoles(@Query() query: FindROlesQueryDto) {
    return await this.rolesService.findRoles(query);
  }

  @Get('/find/:id')
  @UseGuards(JwtAuthGuard)
  async findRoleById(@Param() param: FindRoleByIdParamDto) {
    return await this.rolesService.findRoleById(param);
  }
}
