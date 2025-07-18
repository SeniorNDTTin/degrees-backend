import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { VerifiersService } from './verifiers.service';
import { CreateVerifierDto } from './dto/create-verifier.dto';
import { UpdateVerifierDto } from './dto/update-verifier.dto';

@Controller('verifiers')
export class VerifiersController {
  constructor(private readonly verifiersService: VerifiersService) {}

  @Post('create')
  create(@Body() createVerifierDto: CreateVerifierDto) {
    console.log('Received body:', createVerifierDto);
    return this.verifiersService.create(createVerifierDto);
  }

  @Get('find')
  findAll() {
    return this.verifiersService.findAll();
  }

  @Get('find/:verifierID')
  async findById(@Param('verifierID') verifierID: string) {
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
  async update(
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
  async delete(@Param('verifierID') verifierID: string) {
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