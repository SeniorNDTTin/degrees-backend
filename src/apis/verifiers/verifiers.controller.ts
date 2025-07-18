import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { VerifiersService } from './verifiers.service';
import { CreateVerifierDto } from './dto/create-verifier.dto';
import { UpdateVerifierDto } from './dto/update-verifier.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { User } from '../users/decorators/user.decorator';
import { LoginDto } from '../auth/dto/login.dto';

@Controller('verifiers')
export class VerifiersController {
  constructor(private readonly verifiersService: VerifiersService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@User() user: LoginDto, @Body() createVerifierDto: CreateVerifierDto) {
    console.log('Received body:', createVerifierDto);
    return this.verifiersService.create(createVerifierDto);
  }

  @Get('find')
  @UseGuards(JwtAuthGuard)
  async findAll(@User() user: LoginDto) {
    return this.verifiersService.findAll();
  }

  @Get('find/:verifierID')
  @UseGuards(JwtAuthGuard)
  async findById(@User() user: LoginDto, @Param('verifierID') verifierID: string) {
    const verifier = await this.verifiersService.findById(verifierID);
    if (!verifier) {
      throw new NotFoundException(`Verifier with ID ${verifierID} not found`);
    }
    return {
      statusCode: 200,
      message: 'Success',
      data: verifier
    };
  }

  @Patch('update/:verifierID')
  @UseGuards(JwtAuthGuard)
  async update(
    @User() user: LoginDto,
    @Param('verifierID') verifierID: string,
    @Body() updateVerifierDto: UpdateVerifierDto,
  ) {
    const verifier = await this.verifiersService.update(verifierID, updateVerifierDto);
    if (!verifier) {
      throw new NotFoundException(`Verifier with ID ${verifierID} not found`);
    }
    return {
      statusCode: 200,
      message: 'Success',
      data: verifier
    };
  }

  @Delete('delete/:verifierID')
  @UseGuards(JwtAuthGuard)
  async delete(@User() user: LoginDto, @Param('verifierID') verifierID: string) {
    const verifier = await this.verifiersService.delete(verifierID);
    if (!verifier) {
      throw new NotFoundException(`Verifier with ID ${verifierID} not found`);
    }
    return {
      statusCode: 200,
      message: 'Success',
      data: verifier
    };
  }
} 