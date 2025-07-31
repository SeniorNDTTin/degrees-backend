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
  major: string;

  @IsNumber()
  GPA: number;

  @IsString()
  @IsNotEmpty()
  classification: string;

  @IsDateString()
  issuedDate: Date;

  @IsEmail()
  studentEmail: string;

  @IsString()
  @IsNotEmpty()
  issuerID: string;
}
