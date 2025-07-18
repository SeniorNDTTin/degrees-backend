import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Verifier } from './schemas/verifier.schema';
import { CreateVerifierDto } from './dto/create-verifier.dto';
import { UpdateVerifierDto } from './dto/update-verifier.dto';

@Injectable()
export class VerifiersService {
  constructor(
    @InjectModel(Verifier.name) private verifierModel: Model<Verifier>,
  ) {}

  async create(createVerifierDto: CreateVerifierDto): Promise<Verifier> {
    return this.verifierModel.create(createVerifierDto);
  }

  async findAll(): Promise<Verifier[]> {
    return this.verifierModel.find().exec();
  }

  async findById(verifierID: string): Promise<Verifier | null> {
    return this.verifierModel.findOne({ verifierID }).exec();
  }

  async update(verifierID: string, updateVerifierDto: UpdateVerifierDto): Promise<Verifier | null> {
    return this.verifierModel.findOneAndUpdate({ verifierID }, updateVerifierDto, { new: true }).exec();
  }

  async delete(verifierID: string): Promise<Verifier | null> {
    return this.verifierModel.findOneAndDelete({ verifierID }).exec();
  }
} 