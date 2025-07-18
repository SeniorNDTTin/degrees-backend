import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateCertificateBodyDto {
  @IsString()
  @IsNotEmpty()
  certType: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  score: number;

  @IsString()
  @IsOptional()
  scoreDetails?: string;
}