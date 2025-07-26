import { IsNotEmpty } from 'class-validator';

export class DeleteUserParamDto {
  @IsNotEmpty()
  id: string;
}
