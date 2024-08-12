import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ unique: true, isRequired: true })
  email: string;

  @Prop({ isRequired: true })
  name: string;

  @Prop({ isRequired: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
