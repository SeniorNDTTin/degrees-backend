import { IsNotEmpty } from 'class-validator';

export class FindDegreeByDegreeHashParamDto {
  @IsNotEmpty()
  degreeHash: string;
}
