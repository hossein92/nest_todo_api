import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { User } from 'src/users/schemas/user.schema';

export class CreateTodoDto {
  @ApiProperty({
    example: 'This is a sample title',
    description: 'title',
  })
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty({
    example: 'This is a sample description',
    description: 'description',
  })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiProperty({
    example: 'false',
    description: 'isCompleted',
  })
  @IsBoolean()
  @IsOptional()
  readonly isCompleted?: boolean;

  @IsEmpty({ message: 'you cannot pass user id' })
  readonly user: User;
}
