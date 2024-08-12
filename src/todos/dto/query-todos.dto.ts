// src/todos/dto/query-todos.dto.ts
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryTodosDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  endDate?: string;
}
