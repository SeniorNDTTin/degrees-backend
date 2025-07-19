import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateOTPBodyDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
