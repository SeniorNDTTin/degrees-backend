import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

import { BlocksService } from './blocks.service';
import { FindBlocksQueryDto } from './dto/find-blocks.dto';
import { GetBlocksQuantityParamDto } from './dto/get-blocks-quantity.dto';
import { CheckBlocksParamDto } from './dto/check-blocks.dto';

@Controller({
  path: '/blocks',
  version: '1',
})
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get('/find')
  @UseGuards(JwtAuthGuard)
  async findBlocks(@Query() query: FindBlocksQueryDto) {
    return await this.blocksService.findBlocks(query);
  }

  @Get('/get-blocks-quantity/:collection/:collectionId')
  @UseGuards(JwtAuthGuard)
  async getBlocksQuantity(@Param() param: GetBlocksQuantityParamDto) {
    return await this.blocksService.getBlocksQuantity(param);
  }

  @Get('/check-blocks/:collection/:collectionId')
  @UseGuards(JwtAuthGuard)
  async checkBlocks(@Param() param: CheckBlocksParamDto) {
    return await this.blocksService.checkBlocks(param);
  }
}
