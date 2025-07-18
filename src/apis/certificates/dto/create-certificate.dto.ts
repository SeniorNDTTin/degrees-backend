import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

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

  @IsDateString()
  @IsNotEmpty()
  issuedDate: string;

  @IsString()
  @IsNotEmpty()
  certHash: string;

  @IsString()
  @IsNotEmpty()
  blockchainTxID: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  studentEmail: string;

  @IsString()
  @IsNotEmpty()
  issuerID: string;

  @IsString()
  @IsNotEmpty()
  issuerType: string;

  @IsString()
  @IsNotEmpty()
  studentSignature: string;

  @IsString()
  @IsNotEmpty()
  issuerSignature: string;
}
