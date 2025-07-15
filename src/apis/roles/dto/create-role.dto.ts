import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleBodyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString({ each: true })
  @IsArray()
  @IsNotEmpty()
  permissions: string[];
}
