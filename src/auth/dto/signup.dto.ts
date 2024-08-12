import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'todo@gmail.com',
    description: 'email',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'please enter correct emil' })
  email: string;

  @ApiProperty({
    example: 'hossein',
    description: 'name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

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
