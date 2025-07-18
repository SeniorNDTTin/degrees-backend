import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateVerifierDto {
  @IsString()
  @IsNotEmpty()
  verifierID: string;

  @IsString()
  @IsNotEmpty()
  verifierName: string;

  @IsString()
  @IsNotEmpty()
  organization: string;

  @IsEmail()
  @IsNotEmpty()
  verifierEmail: string;
} 