import { IsNotEmpty } from 'class-validator';

export class DeleteVerifierParamDto {
  @IsNotEmpty()
  id: string;
}
