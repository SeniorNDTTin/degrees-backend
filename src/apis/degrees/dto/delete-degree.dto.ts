import { IsNotEmpty } from 'class-validator';

export class DeleteDegreeParamDto {
  @IsNotEmpty()
  id: string;
}
