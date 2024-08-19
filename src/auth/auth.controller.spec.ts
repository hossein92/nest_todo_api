import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    signUp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should return a token if credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const result = { token: 'testToken' };

      jest.spyOn(authService, 'login').mockResolvedValueOnce(result);

      expect(await authController.login(loginDto)).toEqual(result);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw an UnauthorizedException if credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(authService, 'login').mockImplementationOnce(() => {
        throw new Error('Invalid email or password');
      });

      await expect(authController.login(loginDto)).rejects.toThrow(
        'Invalid email or password',
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('signUp', () => {
    it('should return a token if signup is successful', async () => {
      const signUpDto: SignupDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      const result = { token: 'testToken' };

      jest.spyOn(authService, 'signUp').mockResolvedValueOnce(result);

      expect(await authController.signUp(signUpDto)).toEqual(result);
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });

    it('should throw a ConflictException if email already exists', async () => {
      const signUpDto: SignupDto = {
        email: 'existing@example.com',
        password: 'password',
        name: 'Test User',
      };

      jest.spyOn(authService, 'signUp').mockImplementationOnce(() => {
        throw new Error('User with this email already exists');
      });

      await expect(authController.signUp(signUpDto)).rejects.toThrow(
        'User with this email already exists',
      );
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });
  });
});
