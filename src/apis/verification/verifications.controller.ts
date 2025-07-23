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
import { VerificationsService } from './verifications.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { User } from '../users/decorators/user.decorator';
import { LoginDto } from '../auth/dto/login.dto';

import { CreateVerificationBodyDto } from './dto/create-verification.dto';
import {
  UpdateVerificationParamDto,
  UpdateVerificationBodyDto,
} from './dto/update-verification.dto';
import { DeleteVerificationParamDto } from './dto/delete-verification.dto';
import { FindVerificationByIdParamDto } from './dto/find-verification-by-id.dto';
import { FindVerificationsQueryDto } from './dto/find-verifications.dto';

@Controller({ path: '/verifications', version: '1' })
export class VerificationsController {
  constructor(private readonly service: VerificationsService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  create(@User() user: LoginDto, @Body() body: CreateVerificationBodyDto) {
    return this.service.createVerification(user, body);
  }

  @Patch('/update/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @User() user: LoginDto,
    @Param() param: UpdateVerificationParamDto,
    @Body() body: UpdateVerificationBodyDto,
  ) {
    return this.service.updateVerification(user, param, body);
  }

  @Delete('/delete/:id')
  @UseGuards(JwtAuthGuard)
  delete(@User() user: LoginDto, @Param() param: DeleteVerificationParamDto) {
    return this.service.deleteVerification(user, param);
  }

  @Get('/find')
  @UseGuards(JwtAuthGuard)
  find(@Query() query: FindVerificationsQueryDto) {
    return this.service.findVerifications(query);
  }

  @Get('/find/:id')
  @UseGuards(JwtAuthGuard)
  findById(@Param() param: FindVerificationByIdParamDto) {
    return this.service.findVerificationById(param);
  }
}
