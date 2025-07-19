import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UsersModule } from './apis/users/users.module';
import { AuthModule } from './apis/auth/auth.module';
import { RolesModule } from './apis/roles/roles.module';

import { DegreesModule } from './apis/degrees/degrees.module';

//CRUD operations for certificates
import { CertificatesModule } from './apis/certificates/certificates.module';
import { VerifiersModule } from './apis/verifiers/verifiers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URL', ''),
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    RolesModule,
    UsersModule,

    CertificatesModule,

    VerifiersModule,
    DegreesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
