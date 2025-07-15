import { IsNotEmpty } from 'class-validator';

export class FindRoleByIdParamDto {
  @IsNotEmpty()
  id: string;
}
