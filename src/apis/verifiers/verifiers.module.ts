import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VerifiersService } from './verifiers.service';
import { VerifiersController } from './verifiers.controller';
import { Verifier, VerifierSchema } from './schemas/verifier.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Verifier.name, schema: VerifierSchema },
    ]),
  ],
  controllers: [VerifiersController],
  providers: [VerifiersService],
  exports: [VerifiersService],
})
export class VerifierModule {}
