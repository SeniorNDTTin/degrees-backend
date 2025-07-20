// src/apis/verifications/dto/create-verification.dto.ts
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVerificationBodyDto {


  @IsEnum(['degree', 'certificate'])
  type: 'degree' | 'certificate';

  @IsMongoId()
  @IsNotEmpty()
  verifierId: string;

  @IsMongoId()
  @IsOptional()
  degreeId?: string;

  @IsMongoId()
  @IsOptional()
  certificateId?: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
