import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateVerifierParamDto {
  @IsNotEmpty()
  id: string;
}

export class UpdateVerifierBodyDto {
  @IsString()
  @IsOptional()
  verifierName?: string;

  @IsString()
  @IsOptional()
  organization?: string;

  @IsString()
  @IsOptional()
  verifierEmail?: string;
}
