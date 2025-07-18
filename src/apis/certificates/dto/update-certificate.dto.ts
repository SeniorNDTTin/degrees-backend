import { IsNumber, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

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

  @IsDateString()
  @IsOptional()
  issuedDate?: string;

  @IsString()
  @IsOptional()
  certHash?: string;

  @IsString()
  @IsOptional()
  blockchainTxID?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  studentEmail?: string;

  @IsString()
  @IsOptional()
  issuerID?: string;

  @IsString()
  @IsOptional()
  issuerType?: string;

  @IsString()
  @IsOptional()
  studentSignature?: string;

  @IsString()
  @IsOptional()
  issuerSignature?: string;
}