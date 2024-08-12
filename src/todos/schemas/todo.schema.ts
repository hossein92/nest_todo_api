import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/schemas/user.schema';

export type TodoDocument = HydratedDocument<Todo>;
@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Todo {
  @ApiProperty({
    example: 'sample title',
    description: 'title',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    example: 'This is a sample description',
    description: 'description',
  })
  @Prop()
  description: string;

  @ApiProperty({
    example: 'false',
    description: 'isCompleted',
  })
  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ type: mongoose.Schema.ObjectId, ref: 'User' })
  user: User;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
