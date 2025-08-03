import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '../users/users.module';

import { DegreesService } from './degrees.service';
import { DegreesController } from './degrees.controller';
import { Degree, DegreeSchema } from './schemas/degree.schema';
import { IssuingAgenciesModule } from '../issuing-agencies/issuing-agencies.module';
import { BlocksModule } from '../blocks/blocks.module';
import { VerificationsModule } from '../verification/verifications.module';
import {
  Verification,
  VerificationSchema,
} from '../verification/schemas/verification.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET', ''),
      }),
    }),

    MongooseModule.forFeature([
      { name: Degree.name, schema: DegreeSchema },
      { name: Verification.name, schema: VerificationSchema },
    ]),

    UsersModule,
    IssuingAgenciesModule,
    BlocksModule,
  ],
  controllers: [DegreesController],
  providers: [DegreesService],
  exports: [DegreesService],
})
export class DegreesModule {}
