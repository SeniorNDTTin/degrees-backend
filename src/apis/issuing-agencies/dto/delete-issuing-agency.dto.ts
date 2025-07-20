import { IsNotEmpty } from 'class-validator';

export class DeleteIssuingAgencyParamDto {
  @IsNotEmpty()
  id: string;
}
