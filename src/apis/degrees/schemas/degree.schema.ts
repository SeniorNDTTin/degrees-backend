import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Degree extends Document {
  @Prop({ required: true })
  degreeName: string;

  @Prop({ required: true })
  major: string;

  @Prop({ required: true })
  GPA: number;

  @Prop({ required: true })
  classification: string;

  @Prop({ required: true })
  issuedDate: Date;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  studentEmail: string;

  @Prop({ required: true })
  issuerID: string;

  @Prop({ required: true })
  studentSignature: string;

  @Prop({ required: true })
  issuerSignature: string;

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
