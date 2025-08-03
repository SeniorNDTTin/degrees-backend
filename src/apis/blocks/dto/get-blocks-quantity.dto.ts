import { IsNotEmpty, IsString } from 'class-validator';

export class GetBlocksQuantityParamDto {
  @IsString()
  @IsNotEmpty()
  collection: string;

  @IsString()
  @IsNotEmpty()
  collectionId: string;
}
