import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { Certificate, CertificateSchema } from './schemas/certificate.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SIGNATURE_SECRET', ''),
      }),
    }),

    MongooseModule.forFeature([
      { name: Certificate.name, schema: CertificateSchema },
    ]),
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
