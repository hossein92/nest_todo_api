import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { SignupDto } from './dto/signup.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    return this.authService.login(loginDto);
  }

  @Post('/signup')
  signUp(@Body() signUpDto: SignupDto): Promise<{ token: string }> {
    return this.authService.signUp(signUpDto);
  }
}
