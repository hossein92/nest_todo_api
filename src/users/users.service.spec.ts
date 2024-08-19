import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UnauthorizedException } from '@nestjs/common';
import { SignupDto } from 'src/auth/dto/signup.dto';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<User>;

  const mockUser = {
    _id: 'userId',
    email: 'test@gmail.com',
    name: 'userTest',
    password: 'Password172829A@',
    role: 'USER',
  } as User;

  const mockUserModel = {
    create: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      const result = await service.findOne('test@example.com');
      expect(result).toEqual(mockUser);
      expect(model.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findOne('invalid@example.com')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('findUser', () => {
    it('should return a user if found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      const result = await service.findUser('test@example.com');
      expect(result).toEqual(mockUser);
      expect(model.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      const result = await service.findUser('invalid@example.com');
      expect(result).toBeNull();
      expect(model.findOne).toHaveBeenCalledWith({
        email: 'invalid@example.com',
      });
    });
  });

  describe('singUpUser', () => {
    it('should create and return a new user', async () => {
      const signupDto: SignupDto = {
        email: 'newuser@example.com',
        password: 'newPassword',
        name: 'New User',
      };

      const result = await service.singUpUser(signupDto);
      expect(result).toEqual(mockUser);
      expect(mockUserModel.create).toHaveBeenCalledWith(signupDto);
    });
  });
});
