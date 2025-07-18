import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Verifier extends Document {
  @Prop({ required: true })
  verifierID: string;

  @Prop({ required: true })
  verifierName: string;

  @Prop({ required: true })
  organization: string;

  @Prop({ required: true })
  verifierEmail: string;
}

export const VerifierSchema = SchemaFactory.createForClass(Verifier); 