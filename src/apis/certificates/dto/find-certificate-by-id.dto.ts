import { IsNotEmpty } from 'class-validator';

export class FindCertificateByIdParamDto {
  @IsNotEmpty()
  id: string;
}