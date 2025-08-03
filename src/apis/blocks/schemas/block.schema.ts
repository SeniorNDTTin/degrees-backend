import { HydratedDocument } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BlockDocument = HydratedDocument<Block>;

@Schema({
  collection: 'blocks',
  timestamps: true,
})
export class Block {
  @Prop({ type: Number, required: true })
  index: number;

  @Prop({ type: String, required: true })
  previousHash: string;

  @Prop({ type: String, required: true })
  currentHash: string;

  @Prop({
    type: { collection: String, collectionId: String, userId: String },
    required: true,
  })
  data: { collection: string; collectionId: string; userId: string };
}

export const BlockSchema = SchemaFactory.createForClass(Block);
