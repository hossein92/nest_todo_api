import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { User } from 'src/users/schemas/user.schema';
import { Todo } from './schemas/todo.schema';

// Mock the AuthGuard completely
jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn(() => {
    return {
      canActivate: jest.fn(() => true), // Mock canActivate to always return true
    };
  }),
}));

const mockTodo = {
  _id: 'todoId',
  title: 'Test Todo',
  description: 'Test Description',
  isCompleted: false,
  user: 'userId',
} as unknown as Todo;

const mockUser = {
  _id: 'userId',
  email: 'test@gmail.com',
  name: 'userTest',
  password: 'Password172829A@',
  role: 'USER',
} as User;

const mockTodosService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('TodosController', () => {
  let controller: TodosController;
  let service: TodosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [
        {
          provide: TodosService,
          useValue: mockTodosService,
        },
      ],
    }).compile();

    controller = module.get<TodosController>(TodosController);
    service = module.get<TodosService>(TodosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const createTodoDto: CreateTodoDto = { title: 'Test Todo' };
      jest.spyOn(service, 'create').mockResolvedValueOnce(mockTodo as Todo);

      const result = await controller.create(createTodoDto, mockUser);
      expect(result).toEqual(mockTodo);
      expect(service.create).toHaveBeenCalledWith(createTodoDto, mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of todos', async () => {
      const result = [mockTodo];
      jest.spyOn(service, 'findAll').mockResolvedValueOnce({
        todos: result,
        total: 1,
        totalPages: 1,
      });

      const query = {};
      const response = await controller.findAll(mockUser, query);
      expect(response.todos).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(
        mockUser,
        1,
        10,
        undefined,
        undefined,
        undefined,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single todo', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockTodo as Todo);

      const result = await controller.findOne('todoId', mockUser);
      expect(result).toEqual(mockTodo);
      expect(service.findOne).toHaveBeenCalledWith('todoId', mockUser);
    });
  });

  describe('update', () => {
    it('should update and return the todo', async () => {
      const updateTodoDto: UpdateTodoDto = { title: 'Updated Title' };
      jest.spyOn(service, 'update').mockResolvedValueOnce({
        ...mockTodo,
        title: 'Updated Title',
      } as Todo);

      const result = await controller.update('todoId', updateTodoDto, mockUser);
      expect(result.title).toEqual('Updated Title');
      expect(service.update).toHaveBeenCalledWith(
        'todoId',
        updateTodoDto,
        mockUser,
      );
    });
  });

  describe('remove', () => {
    it('should delete the todo and return it', async () => {
      jest.spyOn(service, 'remove').mockResolvedValueOnce(mockTodo as Todo);

      const result = await controller.remove('todoId', mockUser);
      expect(result).toEqual(mockTodo);
      expect(service.remove).toHaveBeenCalledWith('todoId', mockUser);
    });
  });
});
