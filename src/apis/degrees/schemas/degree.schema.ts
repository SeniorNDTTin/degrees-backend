import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Degree extends Document {
  @Prop({ required: true })
  degreeName: string;

  @Prop({ required: true })
  degreeType: string;

  @Prop({ required: true })
  major: string;

  @Prop({ required: true })
  GPA: number;

  @Prop({ required: true })
  classification: string;

  // Các thuộc tính của bảng Degree/Certificat
  @Prop({ required: true })
  issuedDate: Date;

  @Prop({ required: true })
  certHash: string;

  @Prop({ required: true })
  blockchainTxID: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  studentEmail: string;

  @Prop({ required: true })
  issuerID: string;

  @Prop({ required: true })
  issuerType: string;

  @Prop({ required: true })
  studentSignature: string;

  @Prop({ required: true })
  issuerSignature: string;

  // Metadata
  @Prop({ type: { userId: String, createdAt: Date }, required: true })
  createdBy: { userId: string; createdAt: Date };

  @Prop({ type: [{ userId: String, updatedAt: Date }] })
  updatedBy?: { userId: string; updatedAt: Date }[];

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: { userId: String, deletedAt: Date } })
  deletedBy?: { userId: string; deletedAt: Date };
}

export const DegreeSchema = SchemaFactory.createForClass(Degree);
