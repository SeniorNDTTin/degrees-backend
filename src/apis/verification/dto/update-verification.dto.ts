// src/apis/verifications/dto/update-verification.dto.ts
import { IsBoolean, IsEnum, IsMongoId, IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateVerificationParamDto {
  @IsMongoId()
  id: string;
}

export class UpdateVerificationBodyDto {

  @IsOptional()
  @IsEmail()
  studentEmail: string;

  @IsEnum(['degree', 'certificate'])
  @IsOptional()
  type?: 'degree' | 'certificate';

  @IsMongoId()
  @IsOptional()
  verifierId?: string;

  @IsMongoId()
  @IsOptional()
  degreeId?: string;

  @IsMongoId()
  @IsOptional()
  certificateId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
