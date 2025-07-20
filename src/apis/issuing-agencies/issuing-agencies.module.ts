import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  IssuingAgency,
  IssuingAgencySchema,
} from './schemas/issuing-agency.schema';
import { IssuingAgenciesService } from './issuing-agencies.service';
import { IssuingAgenciesController } from './issuing-agencies.controller';

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
      { name: IssuingAgency.name, schema: IssuingAgencySchema },
    ]),
  ],
  controllers: [IssuingAgenciesController],
  providers: [IssuingAgenciesService],
  exports: [IssuingAgenciesService],
})
export class IssuingAgenciesModule {}
