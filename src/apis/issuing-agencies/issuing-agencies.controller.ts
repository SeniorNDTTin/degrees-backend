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

import {
  UpdateIssuingAgencyBodyDto,
  UpdateIssuingAgencyParamDto,
} from './dto/update-issuing-agency.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { User } from '../users/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { IssuingAgenciesService } from './issuing-agencies.service';
import { CreateIssuingAgencyBodyDto } from './dto/create-issuing-agency.dto';
import { DeleteIssuingAgencyParamDto } from './dto/delete-issuing-agency.dto';
import { FindIssuingAgenciesQueryDto } from './dto/find-issuing-agencies.dto';
import { FindIssuingAgencyByIdParamDto } from './dto/find-issuing-agency-by-id.dto';

@Controller({
  path: '/issuing-agencies',
  version: '1',
})
export class IssuingAgenciesController {
  constructor(
    private readonly issuingAgenciesService: IssuingAgenciesService,
  ) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createIssuingAgency(
    @User() user: LoginDto,
    @Body() body: CreateIssuingAgencyBodyDto,
  ) {
    return await this.issuingAgenciesService.createIssuingAgency(user, body);
  }

  @Patch('/update/:id')
  @UseGuards(JwtAuthGuard)
  async updateIssuingAgency(
    @User() user: LoginDto,
    @Param() param: UpdateIssuingAgencyParamDto,
    @Body() body: UpdateIssuingAgencyBodyDto,
  ) {
    return await this.issuingAgenciesService.updateIssuingAgency(
      user,
      param,
      body,
    );
  }

  @Delete('/delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteIssuingAgency(
    @User() user: LoginDto,
    @Param() param: DeleteIssuingAgencyParamDto,
  ) {
    return await this.issuingAgenciesService.deleteIssuingAgency(user, param);
  }

  @Get('/find')
  @UseGuards(JwtAuthGuard)
  async findIssuingAgencies(@Query() query: FindIssuingAgenciesQueryDto) {
    return await this.issuingAgenciesService.findIssuingAgencies(query);
  }

  @Get('find/:id')
  @UseGuards(JwtAuthGuard)
  async findIssuingAgencyById(@Param() param: FindIssuingAgencyByIdParamDto) {
    return await this.issuingAgenciesService.findIssuingAgencyById(param);
  }
}
