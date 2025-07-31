import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateIssuingAgencyBodyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsBoolean()
  @IsNotEmpty()
  isUniversity: boolean;
}
