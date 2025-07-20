import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVerifierBodyDto {
  @IsString()
  @IsNotEmpty()
  verifierName: string;

  @IsString()
  @IsNotEmpty()
  organization: string;

  @IsString()
  @IsNotEmpty()
  verifierEmail: string;
}
