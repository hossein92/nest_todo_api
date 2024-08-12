import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../oles.enum';

@Schema()
export class User extends Document {
  @Prop({ unique: true, isRequired: true })
  email: string;

  @Prop({ isRequired: true })
  name: string;

  @Prop({ isRequired: true })
  password: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
