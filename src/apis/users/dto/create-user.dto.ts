import {
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserBodyDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  birthday: Date;

  @IsIn(['male', 'female'])
  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  roleId: string;
}
