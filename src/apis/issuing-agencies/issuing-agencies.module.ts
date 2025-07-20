import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  IssuingAgency,
  IssuingAgencySchema,
} from './schemas/issuing-agency.schema';
import { IssuingAgenciesService } from './issuing-agencies.service';
import { IssuingAgenciesController } from './issuing-agencies.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IssuingAgency.name, schema: IssuingAgencySchema },
    ]),
  ],
  controllers: [IssuingAgenciesController],
  providers: [IssuingAgenciesService],
  exports: [IssuingAgenciesService],
})
export class IssuingAgenciesModule {}
