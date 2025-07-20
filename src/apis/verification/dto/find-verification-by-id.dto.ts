// src/apis/verifications/dto/find-verification-by-id.dto.ts
import { IsMongoId } from 'class-validator';

export class FindVerificationByIdParamDto {
  @IsMongoId()
  id: string;
}
