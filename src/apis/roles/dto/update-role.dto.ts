import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRoleParamDto {
  @IsNotEmpty()
  id: string;
}

export class UpdateRoleBodyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  permissions?: string;
}
