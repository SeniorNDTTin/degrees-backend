import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VerifiersService } from './verifiers.service';
import { VerifiersController } from './verifiers.controller';
import { Verifier, VerifierSchema } from './schemas/verifier.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Verifier.name, schema: VerifierSchema },
    ]),

    UsersModule,
  ],
  controllers: [VerifiersController],
  providers: [VerifiersService],
  exports: [VerifiersService],
})
export class VerifiersModule {}
