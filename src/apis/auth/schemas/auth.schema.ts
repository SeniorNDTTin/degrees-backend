import mongoose, { HydratedDocument } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { User } from 'src/apis/users/schemas/user.schema';

export type AuthDocument = HydratedDocument<Auth>;

@Schema({
  collection: 'auths',
  timestamps: true,
})
export class Auth {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  otp: string;

  @Prop({ type: Date, default: Date.now, expires: 180 })
  createdAt?: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
