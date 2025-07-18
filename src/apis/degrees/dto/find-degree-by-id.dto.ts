import { IsNotEmpty } from 'class-validator';

export class FindDegreeByIdParamDto {
  @IsNotEmpty()
  id: string;
}
