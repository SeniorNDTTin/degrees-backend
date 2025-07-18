import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VerifiersService } from './verifiers.service';
import { CreateVerifierDto } from './dto/create-verifier.dto';
import { UpdateVerifierDto } from './dto/update-verifier.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { User } from '../users/decorators/user.decorator';
import { LoginDto } from '../auth/dto/login.dto';
import { FindVerifiersQueryDto } from './dto/find-verifiers.dto';

@Controller('verifiers')
export class VerifiersController {
  constructor(private readonly verifiersService: VerifiersService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(
    @User() user: LoginDto,
    @Body() createVerifierDto: CreateVerifierDto,
  ) {
    console.log('Received body:', createVerifierDto);
    return this.verifiersService.create(createVerifierDto);
  }

  @Get('find')
  @UseGuards(JwtAuthGuard)
  async findAll(@User() user: LoginDto, @Query() query: FindVerifiersQueryDto) {
    return this.verifiersService.findAll(query);
  }

  @Get('find/:id')
  @UseGuards(JwtAuthGuard)
  async findById(@User() user: LoginDto, @Param('id') id: string) {
    const verifier = await this.verifiersService.findById(id);
    if (!verifier) {
      throw new NotFoundException(`Verifier with ID ${id} not found`);
    }
    return verifier;
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @User() user: LoginDto,
    @Param('id') id: string,
    @Body() updateVerifierDto: UpdateVerifierDto,
  ) {
    const verifier = await this.verifiersService.update(id, updateVerifierDto);
    if (!verifier) {
      throw new NotFoundException(`Verifier with ID ${id} not found`);
    }
    return verifier;
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@User() user: LoginDto, @Param('id') id: string) {
    const verifier = await this.verifiersService.delete(id);
    if (!verifier) {
      throw new NotFoundException(`Verifier with ID ${id} not found`);
    }
    return {};
  }
}
