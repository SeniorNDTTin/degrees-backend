// src/apis/verifications/verifications.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VerificationsService } from './verifications.service';
import { VerificationsController } from './verifications.controller';
import {
  Verification,
  VerificationSchema,
} from './schemas/verification.schema';
import { Degree, DegreeSchema } from '../degrees/schemas/degree.schema';
import {
  Certificate,
  CertificateSchema,
} from '../certificates/schemas/certificate.schema';
import { UsersModule } from '../users/users.module';
import { IssuingAgenciesModule } from '../issuing-agencies/issuing-agencies.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Verification.name, schema: VerificationSchema },
      { name: Degree.name, schema: DegreeSchema },
      { name: Certificate.name, schema: CertificateSchema },
    ]),

    UsersModule,
    IssuingAgenciesModule,
  ],
  providers: [VerificationsService],
  controllers: [VerificationsController],
})
export class VerificationsModule {}
