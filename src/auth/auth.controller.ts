import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @ApiOperation({ description: 'Log in a user and return a JWT token.' })
  @ApiBody({
    description: 'Login credentials',
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns a JWT token.',
    schema: {
      example: {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YjlkMzg4MTc1MGM1MGE3ODEzNzJkZiIsImlhdCI6MTcyMzk2MTgzOCwiZXhwIjoxNzI0MjIxMDM4fQ.uAAXs1rUYYFTd3Lm3BGi_3fwViedEpfPjQMEwhIXYY4',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        message: 'Invalid email or password',
      },
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    return this.authService.login(loginDto);
  }

  @Post('/signup')
  @ApiOperation({ description: 'Sign up a new user and return a JWT token.' })
  @ApiBody({
    description: 'Signup details',
    type: SignupDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Signup successful. Returns a JWT token.',
    schema: {
      example: {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YjlkMzg4MTc1MGM1MGE3ODEzNzJkZiIsImlhdCI6MTcyMzk2MTgzOCwiZXhwIjoxNzI0MjIxMDM4fQ.uAAXs1rUYYFTd3Lm3BGi_3fwViedEpfPjQMEwhIXYY4',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Invalid signup data or email already exists',
    schema: {
      example: {
        message: 'User with this email already exists',
      },
    },
  })
  async signUp(@Body() signUpDto: SignupDto): Promise<{ token: string }> {
    return this.authService.signUp(signUpDto);
  }
}
