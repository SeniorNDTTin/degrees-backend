import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '../users/users.module';

import { DegreesService } from './degrees.service';
import { DegreesController } from './degrees.controller';
import { Degree, DegreeSchema } from './schemas/degree.schema';
import { IssuingAgenciesModule } from '../issuing-agencies/issuing-agencies.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET', ''),
      }),
    }),

    MongooseModule.forFeature([{ name: Degree.name, schema: DegreeSchema }]),

    UsersModule,
    IssuingAgenciesModule,
  ],
  controllers: [DegreesController],
  providers: [DegreesService],
  exports: [DegreesService],
})
export class DegreesModule {}
