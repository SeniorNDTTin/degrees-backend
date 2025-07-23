import mongoose from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type IssuingAgencyDocument = mongoose.HydratedDocument<IssuingAgency>;

@Schema({
  collection: 'issuing-agency',
  timestamps: true,
})
export class IssuingAgency {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, unique: true, required: true })
  email: string;

  @Prop({ type: String, required: true })
  location: string;

  @Prop({ type: String })
  publicKey?: string;

  @Prop({ type: Boolean, required: true })
  isUniversity: boolean;

  @Prop({ type: { userId: String, createdAt: Date }, required: true })
  createdBy: { userId: string; createdAt: Date };

  @Prop({ type: [{ userId: String, updatedAt: Date }] })
  updatedBy?: { userId: string; updatedAt: Date }[];

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: { userId: String, deletedAt: Date } })
  deletedBy?: { userId: string; deletedAt: Date };
}

export const IssuingAgencySchema = SchemaFactory.createForClass(IssuingAgency);
