import mongoose from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CertificateDocument = mongoose.HydratedDocument<Certificate>;

@Schema({
  collection: 'certificates',
  timestamps: true,
})
export class Certificate {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Number, required: true })
  score: number;

  @Prop({ type: String })
  scoreDetails: string;

  @Prop({ type: Date, required: true })
  issuedDate: Date;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String, required: true })
  studentEmail: string;

  @Prop({ type: String, required: true })
  issuerID: string;

  @Prop({ type: String, required: true })
  certificateHash: string;

  @Prop({ type: String })
  qrCode?: string;

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
