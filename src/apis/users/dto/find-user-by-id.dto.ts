import { IsNotEmpty } from 'class-validator';

export class FindUserByIdParamDto {
  @IsNotEmpty()
  id: string;
}
