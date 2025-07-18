import mongoose from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type VerifierDocument = mongoose.HydratedDocument<Verifier>;

@Schema({
  collection: 'verifiers',
  timestamps: true,
})
export class Verifier {
  @Prop({ type: String, required: true })
  verifierName: string;

  @Prop({ type: String, required: true })
  oragranization: string;

  @Prop({ type: String, required: true })
  verifierEmail: string;

  @Prop({ type: { userId: String, createdAt: Date }, required: true })
  createdBy: { userId: string; createdAt: Date };

  @Prop({ type: [{ userId: String, updatedAt: Date }] })
  updatedBy?: { userId: string; updatedAt: Date }[];

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: { userId: String, deletedAt: Date } })
  deletedBy?: { userId: string; deletedAt: Date };
}

export const VerifierSchema = SchemaFactory.createForClass(Verifier);
