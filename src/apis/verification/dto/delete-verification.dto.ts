// src/apis/verifications/dto/delete-verification.dto.ts
import { IsMongoId } from 'class-validator';

export class DeleteVerificationParamDto {
  @IsMongoId()
  id: string;
}
