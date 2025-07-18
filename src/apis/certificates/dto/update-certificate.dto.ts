import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCertificateParamDto {
  @IsNotEmpty()
  id: string;
}

export class UpdateCertificateBodyDto {
  @IsString()
  @IsOptional()
  certType?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  score?: number;

  @IsString()
  @IsOptional()
  scoreDetails?: string;
}