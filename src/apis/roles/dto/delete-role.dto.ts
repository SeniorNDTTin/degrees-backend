import { IsNotEmpty } from 'class-validator';

export class DeleteRoleParamDto {
  @IsNotEmpty()
  id: string;
}
