import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { getModelToken } from '@nestjs/mongoose';
import { Todo } from './schemas/todo.schema';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { User } from 'src/users/schemas/user.schema';
import { validateObjectId } from 'src/common/validation/validate-object-id.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

jest.mock('src/common/validation/validate-object-id.util'); // Mock the utility function

const mockTodo = {
  _id: 'todoId',
  title: 'Test Todo',
  description: 'Test Description',
  isCompleted: false,
  user: 'userId',
};

const mockUser = {
  _id: 'userId',
  email: 'test@gmail.com',
  name: 'userTest',
  password: 'Password172829A@',
  role: 'USER',
} as User;

const mockTodoModel = {
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  findByIdAndDelete: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(mockTodo),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('TodosService', () => {
  let service: TodosService;
  let model: Model<Todo>;
  let cacheManager: Cache;
  let mockValidateObjectId: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getModelToken(Todo.name),
          useValue: mockTodoModel,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    model = module.get<Model<Todo>>(getModelToken(Todo.name));
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    mockValidateObjectId = validateObjectId as jest.Mock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new todo and invalidate related cache', async () => {
      const createTodoDto: CreateTodoDto = mockTodo;
      jest.spyOn(model, 'create').mockResolvedValueOnce(mockTodo as any);

      const result = await service.create(createTodoDto, mockUser as User);

      expect(result).toEqual(mockTodo);
      expect(cacheManager.del).toHaveBeenCalledWith(`todos-${mockUser._id}-*`);
    });
  });

  describe('findAll', () => {
    it('should return cached todos if available', async () => {
      const todos = [mockTodo];
      const cachedResult = { todos, total: 1, totalPages: 1 };

      // Cast cacheManager.get as a Jest mock and set the mockResolvedValueOnce
      (cacheManager.get as jest.Mock).mockResolvedValueOnce(cachedResult);

      const result = await service.findAll(mockUser as User, 1, 10);

      expect(result).toEqual(cachedResult);
      expect(cacheManager.get).toHaveBeenCalledWith(
        `todos-${mockUser._id}-1-10-undefined-undefined-undefined`,
      );
    });

    it('should query database if cache is empty and cache the result', async () => {
      const todos = [mockTodo];
      // Cast cacheManager.get as a Jest mock and set the mockResolvedValueOnce
      (cacheManager.get as jest.Mock).mockResolvedValueOnce(null);

      jest.spyOn(model, 'find').mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(todos),
      } as any);

      jest.spyOn(model, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(todos.length),
      } as any);

      const result = await service.findAll(mockUser as User, 1, 10);

      expect(result.todos).toEqual(todos);
      expect(result.total).toEqual(todos.length);
      expect(result.totalPages).toEqual(1);
      expect(cacheManager.set).toHaveBeenCalledWith(
        `todos-${mockUser._id}-1-10-undefined-undefined-undefined`,
        result,
        300,
      );
    });
  });

  describe('findOne', () => {
    it('should return cached todo if available', async () => {
      mockValidateObjectId.mockImplementationOnce(() => true); // Simulate successful validation

      // Cast cacheManager.get as a Jest mock and set the mockResolvedValueOnce
      (cacheManager.get as jest.Mock).mockResolvedValueOnce(mockTodo);

      const result = await service.findOne('todoId', mockUser as User);

      expect(result).toEqual(mockTodo);
      expect(cacheManager.get).toHaveBeenCalledWith(
        `todo-todoId-${mockUser._id}`,
      );
    });

    it('should query database if cache is empty and cache the result', async () => {
      mockValidateObjectId.mockImplementationOnce(() => true); // Simulate successful validation
      // Cast cacheManager.get as a Jest mock and set the mockResolvedValueOnce
      (cacheManager.get as jest.Mock).mockResolvedValueOnce(null);

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockTodo),
      } as any);

      const result = await service.findOne('todoId', mockUser as User);

      expect(result).toEqual(mockTodo);
      expect(cacheManager.set).toHaveBeenCalledWith(
        `todo-todoId-${mockUser._id}`,
        mockTodo,
        300,
      );
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockValidateObjectId.mockImplementationOnce(() => true); // Simulate successful validation
      // Cast cacheManager.get as a Jest mock and set the mockResolvedValueOnce
      (cacheManager.get as jest.Mock).mockResolvedValueOnce(null);

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findOne('todoId', mockUser as User)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update the todo, invalidate related cache, and return the updated todo', async () => {
      mockValidateObjectId.mockImplementationOnce(() => true); // Simulate successful validation
      const updateTodoDto: UpdateTodoDto = { title: 'Updated Title' };
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValueOnce({ ...mockTodo, title: 'Updated Title' }),
      } as any);

      const result = await service.update(
        'todoId',
        updateTodoDto,
        mockUser as User,
      );

      expect(result.title).toEqual('Updated Title');
      expect(cacheManager.del).toHaveBeenCalledWith(
        `todo-todoId-${mockUser._id}`,
      );
      expect(cacheManager.del).toHaveBeenCalledWith(`todos-${mockUser._id}-*`);
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockValidateObjectId.mockImplementationOnce(() => true); // Simulate successful validation
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        service.update('todoId', {} as UpdateTodoDto, mockUser as User),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete the todo, invalidate related cache, and return the deleted todo', async () => {
      mockValidateObjectId.mockImplementationOnce(() => true); // Simulate successful validation
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockTodo),
      } as any);

      const result = await service.remove('todoId', mockUser as User);

      expect(result).toEqual(mockTodo);
      expect(cacheManager.del).toHaveBeenCalledWith(
        `todo-todoId-${mockUser._id}`,
      );
      expect(cacheManager.del).toHaveBeenCalledWith(`todos-${mockUser._id}-*`);
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockValidateObjectId.mockImplementationOnce(() => true); // Simulate successful validation
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.remove('todoId', mockUser as User)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
