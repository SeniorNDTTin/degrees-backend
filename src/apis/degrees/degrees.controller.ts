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

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { User } from '../users/decorators/user.decorator';
import { LoginDto } from '../auth/dto/login.dto';

import { DegreesService } from './degrees.service';
import { CreateDegreeBodyDto } from './dto/create-degree.dto';
import { UpdateDegreeDto } from './dto/update-degree.dto';
import { FindDegreesQueryDto } from './dto/find-degrees.dto';
import { DeleteDegreeParamDto } from './dto/delete-degree.dto';
import { FindDegreeByIdParamDto } from './dto/find-degree-by-id.dto';
import { FindDegreeByDegreeHashParamDto } from './dto/find-degree-by-degree-hash.dto';

@Controller({
  path: '/degrees',
  version: '1',
})
export class DegreesController {
  constructor(private readonly degreesService: DegreesService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createDegree(
    @User() user: LoginDto,
    @Body() body: CreateDegreeBodyDto,
  ) {
    return await this.degreesService.createDegree(user, body);
  }

  @Patch('/update/:id')
  @UseGuards(JwtAuthGuard)
  async updateDegree(
    @User() user: LoginDto,
    @Param() param: FindDegreeByIdParamDto,
    @Body() body: UpdateDegreeDto,
  ) {
    return await this.degreesService.updateDegree(user, param, body);
  }

  @Delete('/delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteDegree(
    @User() user: LoginDto,
    @Param() param: DeleteDegreeParamDto,
  ) {
    return await this.degreesService.deleteDegree(user, param);
  }

  @Get('/find')
  @UseGuards(JwtAuthGuard)
  async findDegrees(
    @User() user: LoginDto,
    @Query() query: FindDegreesQueryDto,
  ) {
    console.log(user);
    return await this.degreesService.findDegrees(query);
  }

  @Get('/find/:id')
  @UseGuards(JwtAuthGuard)
  async findDegreeById(@Param() param: FindDegreeByIdParamDto) {
    return await this.degreesService.findDegreeById(param);
  }

  @Get('/find/by/degree-hash/:degreeHash')
  @UseGuards(JwtAuthGuard)
  async findDegreeByDegreeHash(
    @User() user: LoginDto,
    @Param() param: FindDegreeByDegreeHashParamDto,
  ) {
    return await this.degreesService.findDegreeByDegreeHash(user, param);
  }
}
