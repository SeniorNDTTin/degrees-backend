import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '../users/users.module';

import { DegreesService } from './degrees.service';
import { DegreesController } from './degrees.controller';
import { Degree, DegreeSchema } from './schemas/degree.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SIGNATURE_SECRET', ''),
      }),
    }),

    MongooseModule.forFeature([{ name: Degree.name, schema: DegreeSchema }]),

    UsersModule,
  ],
  controllers: [DegreesController],
  providers: [DegreesService],
  exports: [DegreesService],
})
export class DegreesModule {}
