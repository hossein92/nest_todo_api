import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const mockUsersService = {
  findOne: jest.fn(),
  findUser: jest.fn(),
  singUpUser: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('testToken'),
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should return a token if credentials are valid', async () => {
      const password = 'testPassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      mockUsersService.findOne.mockResolvedValue({
        _id: 'testId',
        password: hashedPassword,
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.login({
        email: 'test@example.com',
        password,
      });

      expect(result).toEqual({ token: 'testToken' });
      expect(usersService.findOne).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw an UnauthorizedException if credentials are invalid', async () => {
      mockUsersService.findOne.mockResolvedValue({
        _id: 'testId',
        password: 'wrongPassword',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'testPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signUp', () => {
    it('should throw a ConflictException if user with email already exists', async () => {
      mockUsersService.findUser.mockResolvedValue(true);

      await expect(
        authService.signUp({
          email: 'test@example.com',
          password: 'A27283sjdh@jd#sjkdj!kskjx',
          name: 'hossein',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should return a token if signup is successful', async () => {
      mockUsersService.findUser.mockResolvedValue(null);
      mockUsersService.singUpUser.mockResolvedValue({ _id: 'testId' });
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'hossein',
      });

      expect(result).toEqual({ token: 'testToken' });
      expect(usersService.findUser).toHaveBeenCalledWith('test@example.com');
      expect(usersService.singUpUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'hossein',
      });
    });
  });
});
