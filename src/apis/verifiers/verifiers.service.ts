import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, RootFilterQuery } from 'mongoose';
import { Verifier } from './schemas/verifier.schema';
import { CreateVerifierDto } from './dto/create-verifier.dto';
import { UpdateVerifierDto } from './dto/update-verifier.dto';
import { FindVerifiersQueryDto } from './dto/find-verifiers.dto';
import sortHelper from 'src/helpers/sort.helper';
import paginationHelper from 'src/helpers/pagination.helper';

@Injectable()
export class VerifiersService {
  constructor(
    @InjectModel(Verifier.name) private verifierModel: Model<Verifier>,
  ) {}

  async create(createVerifierDto: CreateVerifierDto): Promise<Verifier> {
    return this.verifierModel.create(createVerifierDto);
  }

  async countDocuments({ filter }: { filter: RootFilterQuery<Verifier> }) {
    return await this.verifierModel.countDocuments(filter);
  }

  async find({
    filter,
    sort,
    skip,
    limit,
  }: {
    filter: RootFilterQuery<Verifier>;
    sort?: { [key: string]: mongoose.SortOrder };
    skip?: number;
    limit?: number;
  }) {
    return await this.verifierModel
      .find(filter)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20);
  }

  async findAll(query: FindVerifiersQueryDto) {
    const { filter, page, limit } = query;
    const filterOptions: {
      verifierName?: RegExp;
      organization?: RegExp;
      verifierEmail?: RegExp;
    } = {};
    let sort = {};
    const pagination = paginationHelper(page, limit);

    if (filter) {
      const { verifierName, organization, verifierEmail, sortBy, sortOrder } =
        filter;

      if (verifierName) {
        filterOptions.verifierName = new RegExp(verifierName as string, 'i');
      }

      if (organization) {
        filterOptions.organization = new RegExp(organization as string, 'i');
      }

      if (verifierEmail) {
        filterOptions.verifierEmail = new RegExp(verifierEmail as string, 'i');
      }

      sort = sortHelper(sortBy as string, sortOrder as string);
    }

    const [total, verifiers] = await Promise.all([
      this.countDocuments({ filter: filterOptions }),
      this.find({
        filter: filterOptions,
        sort,
        skip: pagination.skip,
        limit: pagination.limit,
      }),
    ]);

    return {
      verifiers: {
        total,
        page,
        limit,
        items: verifiers,
      },
    };
  }

  async findById(id: string): Promise<Verifier | null> {
    return this.verifierModel.findById(id).exec();
  }

  async update(
    id: string,
    updateVerifierDto: UpdateVerifierDto,
  ): Promise<Verifier | null> {
    return this.verifierModel
      .findByIdAndUpdate(id, updateVerifierDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Verifier | null> {
    return this.verifierModel.findByIdAndDelete(id).exec();
  }
}
