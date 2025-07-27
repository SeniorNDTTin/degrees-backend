//src/apis/verifications/schemas/verification.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

export type VerificationDocument = mongoose.HydratedDocument<Verification>;

@Schema({ collection: 'verifications', timestamps: true })
export class Verification {
  @Prop({ required: true, enum: ['degree', 'certificate'] })
  type: 'degree' | 'certificate';

  @Prop({ type: Types.ObjectId, ref: 'Verifier', required: true })
  verifierId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Degree',
    required: function () {
      return this.type === 'degree';
    },
  })
  degreeId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Certificate',
    required: function () {
      return this.type === 'certificate';
    },
  })
  certificateId?: Types.ObjectId;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: { userId: String, createdAt: Date }, required: true })
  createdBy: { userId: string; createdAt: Date };

  @Prop({ type: [{ userId: String, updatedAt: Date }] })
  updatedBy?: { userId: string; updatedAt: Date }[];

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: { userId: String, deletedAt: Date } })
  deletedBy?: { userId: string; deletedAt: Date };
}

export const VerificationSchema = SchemaFactory.createForClass(Verification);
