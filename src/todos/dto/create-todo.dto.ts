import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
