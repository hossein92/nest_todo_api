import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

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
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
