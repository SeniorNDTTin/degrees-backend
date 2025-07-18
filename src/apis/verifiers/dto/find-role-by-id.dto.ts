import { IsNotEmpty } from 'class-validator';

export class FindVerifierByIdParamDto {
  @IsNotEmpty()
  id: string;
}
