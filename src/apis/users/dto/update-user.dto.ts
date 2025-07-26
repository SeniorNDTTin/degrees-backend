import {
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserParamDto {
  @IsNotEmpty()
  id: string;
}

export class UpdateUserBodyDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  @IsString()
  email?: string;

  @IsOptional()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  @IsString()
  password?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthday?: Date;

  @IsOptional()
  @IsIn(['male', 'female'])
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  roleId?: string;
}
