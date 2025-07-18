import { IsNotEmpty } from 'class-validator';

export class DeleteCertificateParamDto {
  @IsNotEmpty()
  id: string;
}
