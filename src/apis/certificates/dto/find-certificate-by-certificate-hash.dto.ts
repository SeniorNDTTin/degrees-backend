import { IsNotEmpty } from 'class-validator';

export class FindCertificateByCertificateHashParamDto {
  @IsNotEmpty()
  certificateHash: string;
}
