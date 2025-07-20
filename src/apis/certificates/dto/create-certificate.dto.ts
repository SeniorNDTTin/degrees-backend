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
  title: string;

  @IsNumber()
  @IsNotEmpty()
  score: number;

  @IsString()
  @IsOptional()
  scoreDetails?: string;

  @IsDateString()
  @IsNotEmpty()
  issuedDate: Date;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  studentEmail: string;

  @IsString()
  @IsNotEmpty()
  issuerID: string;
}
