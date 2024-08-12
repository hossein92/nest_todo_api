import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'todo@gmail.com',
    description: 'email',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'please enter correct email' })
  email: string;

  @ApiProperty({
    example: 'A27283sjdh@jd#sjkdj!kskjx',
    description: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;
}