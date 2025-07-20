import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateIssuingAgencyParamDto {
  @IsNotEmpty()
  id: string;
}

export class UpdateIssuingAgencyBodyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  location: string;

  @IsBoolean()
  @IsOptional()
  isUniversity: boolean;
}
