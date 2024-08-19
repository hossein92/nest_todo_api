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

describe('TodosService', () => {
  let service: TodosService;
  let model: Model<Todo>;
  let mockValidateObjectId: jest.Mock;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getModelToken(Todo.name),
          useValue: mockTodoModel,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    model = module.get<Model<Todo>>(getModelToken(Todo.name));
    mockValidateObjectId = validateObjectId as jest.Mock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const createTodoDto: CreateTodoDto = mockTodo;
      jest.spyOn(model, 'create').mockResolvedValueOnce(mockTodo as any);

      const result = await service.create(createTodoDto, mockUser as User);
      expect(result).toEqual(mockTodo);
    });
  });

  describe('findAll', () => {
    it('should return all todos for the user', async () => {
      const todos = [mockTodo];

      // Mock the find method
      jest.spyOn(model, 'find').mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(todos),
      } as any);

      // Mock the countDocuments method
      jest.spyOn(model, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(todos.length),
      } as any);

      const result = await service.findAll(mockUser as User, 1, 10);

      expect(result.todos).toEqual(todos);
      expect(result.total).toEqual(todos.length);
      expect(result.totalPages).toEqual(1);
    });
  });

  describe('findOne', () => {
    it('should return a todo if found', async () => {
      mockValidateObjectId.mockImplementationOnce(() => true); // Simulate successful validation
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockTodo),
      } as any);

      const result = await service.findOne('todoId', mockUser as User);
      expect(result).toEqual(mockTodo);
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockValidateObjectId.mockImplementationOnce(() => true); // Simulate successful validation
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findOne('todoId', mockUser as User)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the todo', async () => {
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
    it('should delete the todo and return it', async () => {
      mockValidateObjectId.mockImplementationOnce(() => true); // Simulate successful validation
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockTodo),
      } as any);

      const result = await service.remove('todoId', mockUser as User);
      expect(result).toEqual(mockTodo);
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
