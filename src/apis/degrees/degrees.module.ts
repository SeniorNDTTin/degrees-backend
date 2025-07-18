import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DegreesService } from './degrees.service';
import { DegreesController } from './degrees.controller';
import { Degree, DegreeSchema } from './schemas/degree.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Degree.name, schema: DegreeSchema }]),
  ],
  controllers: [DegreesController],
  providers: [DegreesService],
  exports: [DegreesService],
})
export class DegreesModule {}
