import { Model, RootFilterQuery, SortOrder } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Block } from './schemas/block.schema';
import { GetBlocksQuantityParamDto } from './dto/get-blocks-quantity.dto';
import { FindBlocksQueryDto } from './dto/find-blocks.dto';
import { CheckBlocksParamDto } from './dto/check-blocks.dto';

@Injectable()
export class BlocksService {
  constructor(
    @InjectModel(Block.name) private readonly blockModel: Model<Block>,
  ) {}

  async getNextBlockIndex() {
    const lastBlock = await this.blockModel
      .findOne()
      .sort({ index: -1 })
      .exec();
    return lastBlock ? lastBlock.index + 1 : 0;
  }

  async countDocuments({ filter }: { filter: RootFilterQuery<Block> }) {
    return await this.blockModel.countDocuments(filter);
  }

  async find({
    filter,
    sort,
    skip,
    limit,
  }: {
    filter: RootFilterQuery<Block>;
    sort?: { [key: string]: SortOrder };
    skip?: number;
    limit?: number;
  }) {
    return await this.blockModel
      .find(filter)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20);
  }

  async create({ doc }: { doc: Block }) {
    const newBlock = new this.blockModel(doc);
    return await newBlock.save();
  }

  // GET /v1/blocks/find?filter?={}
  async findBlocks(query: FindBlocksQueryDto) {
    const { filter } = query;

    const filterOptions: {
      'data.collection'?: string;
      'data.collectionId'?: string;
    } = {};

    if (filter) {
      const { collection, collectionId } = filter;

      if (collection) {
        filterOptions['data.collection'] = collection as string;
      }

      if (collectionId) {
        filterOptions['data.collectionId'] = collectionId as string;
      }
    }

    const [total, blocks] = await Promise.all([
      this.countDocuments({ filter: filterOptions }),
      this.find({ filter: filterOptions }),
    ]);

    return {
      blocks: {
        total,
        page: 0,
        limit: 0,
        items: blocks,
      },
    };
  }

  // GET /v1/blocks/get-blocks-quantity
  async getBlocksQuantity(param: GetBlocksQuantityParamDto) {
    const { collection, collectionId } = param;

    const quantity = await this.countDocuments({
      filter: {
        'data.collection': collection,
        'data.collectionId': collectionId,
      },
    });

    return { quantity };
  }

  // GET /v1/blocks/check-blocks
  async checkBlocks(param: CheckBlocksParamDto) {
    const { collection, collectionId } = param;

    const blocks = await this.find({
      filter: {
        'data.collection': collection,
        'data.collectionId': collectionId,
      },
      sort: { index: 'asc' },
    });

    const blocksLength = blocks.length;
    for (let i = blocksLength - 1; i > 0; i--) {
      const previousHash = blocks[i].previousHash;

      if (previousHash !== blocks[i - 1].currentHash) {
        return { success: false };
      }
    }

    return { success: true };
  }
}
