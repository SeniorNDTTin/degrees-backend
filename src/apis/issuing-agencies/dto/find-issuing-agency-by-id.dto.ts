import { IsNotEmpty } from 'class-validator';

export class FindIssuingAgencyByIdParamDto {
  @IsNotEmpty()
  id: string;
}
