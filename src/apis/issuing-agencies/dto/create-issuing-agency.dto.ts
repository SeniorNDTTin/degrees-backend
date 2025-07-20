import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateIssuingAgencyBodyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  publicKey: string;

  @IsBoolean()
  @IsNotEmpty()
  isUniversity: boolean;
}
