import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UsersModule } from './apis/users/users.module';
import { AuthModule } from './apis/auth/auth.module';
import { RolesModule } from './apis/roles/roles.module';
import { DegreesModule } from './apis/degrees/degrees.module';
import { IssuingAgenciesModule } from './apis/issuing-agencies/issuing-agencies.module';
import { CertificatesModule } from './apis/certificates/certificates.module';
import { VerifiersModule } from './apis/verifiers/verifiers.module';
import { VerificationsModule } from './apis/verification/verifications.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL', ''),
      }),
    }),

    AuthModule,
    RolesModule,
    UsersModule,
    CertificatesModule,
    VerifiersModule,
    VerificationsModule,
    DegreesModule,
    IssuingAgenciesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
