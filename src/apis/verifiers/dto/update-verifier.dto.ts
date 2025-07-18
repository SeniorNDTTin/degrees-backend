import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateVerifierDto {
  @IsString()
  @IsOptional()
  verifierName?: string;

  @IsString()
  @IsOptional()
  organization?: string;

  @IsEmail()
  @IsOptional()
  verifierEmail?: string;
}
