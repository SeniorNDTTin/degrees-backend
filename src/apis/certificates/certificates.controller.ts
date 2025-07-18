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

import { CertificatesService } from './certificates.service';
import { FindCertificatesQueryDto } from './dto/find-certificates.dto';
import { CreateCertificateBodyDto } from './dto/create-certificate.dto';
import { DeleteCertificateParamDto } from './dto/delete-certificate.dto';
import { FindCertificateByIdParamDto } from './dto/find-certificate-by-id.dto';
import { UpdateCertificateBodyDto, UpdateCertificateParamDto } from './dto/update-certificate.dto';

@Controller({
  path: '/certificates',
  version: '1',
})
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createCertificate(@User() user: LoginDto, @Body() body: CreateCertificateBodyDto) {
    return await this.certificatesService.createCertificate(user, body);
  }

  @Patch('/update/:id')
  @UseGuards(JwtAuthGuard)
  async updateCertificate(
    @User() user: LoginDto,
    @Param() param: UpdateCertificateParamDto,
    @Body() body: UpdateCertificateBodyDto,
  ) {
    return await this.certificatesService.updateCertificate(user, param, body);
  }

  @Delete('/delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCertificate(@User() user: LoginDto, @Param() param: DeleteCertificateParamDto) {
    return await this.certificatesService.deleteCertificate(user, param);
  }

  @Get('/find')
  @UseGuards(JwtAuthGuard)
  async findCertificates(@Query() query: FindCertificatesQueryDto) {
    return await this.certificatesService.findCertificates(query);
  }

  @Get('/find/:id')
  @UseGuards(JwtAuthGuard)
  async findCertificateById(@Param() param: FindCertificateByIdParamDto) {
    return await this.certificatesService.findCertificateById(param);
  }
}