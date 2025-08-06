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

import {
  UpdateVerifierBodyDto,
  UpdateVerifierParamDto,
} from './dto/update-verifier.dto';
import { VerifiersService } from './verifiers.service';
import { CreateVerifierBodyDto } from './dto/create-verfier.dto';
import { FindVerifiersQueryDto } from './dto/find-verifiers.dto';
import { DeleteVerifierParamDto } from './dto/delete-verifier.dto';
import { FindVerifierByIdParamDto } from './dto/find-verifier-by-id.dto';

@Controller({
  path: '/verifiers',
  version: '1',
})
export class VerifiersController {
  constructor(private readonly verifiersService: VerifiersService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createVerifier(
    @User() user: LoginDto,
    @Body() body: CreateVerifierBodyDto,
  ) {
    return await this.verifiersService.createVerifier(user, body);
  }

  @Patch('/update/:id')
  @UseGuards(JwtAuthGuard)
  async updateVerifier(
    @User() user: LoginDto,
    @Param() param: UpdateVerifierParamDto,
    @Body() body: UpdateVerifierBodyDto,
  ) {
    return await this.verifiersService.updateVerifier(user, param, body);
  }

  @Delete('/delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteVerifer(
    @User() user: LoginDto,
    @Param() param: DeleteVerifierParamDto,
  ) {
    return await this.verifiersService.deleteVerifier(user, param);
  }

  @Get('/find')
  @UseGuards(JwtAuthGuard)
  async findVerifiers(@Query() query: FindVerifiersQueryDto) {
    return await this.verifiersService.findVerifiers(query);
  }

  @Get('/find/:id')
  @UseGuards(JwtAuthGuard)
  async findRoleById(@Param() param: FindVerifierByIdParamDto) {
    return await this.verifiersService.findVerifierById(param);
  }
}
