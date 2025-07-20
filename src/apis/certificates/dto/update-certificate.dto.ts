import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class UpdateCertificateParamDto {
  @IsNotEmpty()
  id: string;
}

export class UpdateCertificateBodyDto {
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
  issuedDate?: Date;
  
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  studentEmail?: string;

  @IsString()
  @IsOptional()
  issuerID?: string;
}
