import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CreateDegreeBodyDto {
  @IsString()
  @IsNotEmpty()
  degreeName: string;

  @IsString()
  @IsNotEmpty()
  degreeType: string;

  @IsString()
  @IsNotEmpty()
  major: string;

  @IsNumber()
  GPA: number;

  @IsString()
  @IsNotEmpty()
  classification: string;

  @IsDateString()
  issuedDate: Date;

  @IsString()
  @IsNotEmpty()
  certHash: string;

  @IsString()
  @IsNotEmpty()
  blockchainTxID: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsEmail()
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
