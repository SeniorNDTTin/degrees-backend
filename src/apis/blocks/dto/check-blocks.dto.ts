import { IsNotEmpty, IsString } from 'class-validator';

export class CheckBlocksParamDto {
  @IsString()
  @IsNotEmpty()
  collection: string;

  @IsString()
  @IsNotEmpty()
  collectionId: string;
}
