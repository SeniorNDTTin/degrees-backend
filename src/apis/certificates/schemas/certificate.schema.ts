import mongoose from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CertificateDocument = mongoose.HydratedDocument<Certificate>;

@Schema({
  collection: 'certificates',
  timestamps: true,
})
export class Certificate {
  @Prop({ type: String, required: true })
  certType: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Number, required: true })
  score: number;

  @Prop({ type: String })
  scoreDetails: string;

  @Prop({ type: { userId: String, createdAt: Date }, required: true })
  createdBy: { userId: string; createdAt: Date };

  @Prop({ type: [{ userId: String, updatedAt: Date }] })
  updatedBy?: { userId: string; updatedAt: Date }[];

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: { userId: String, deletedAt: Date } })
  deletedBy?: { userId: string; deletedAt: Date };
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);