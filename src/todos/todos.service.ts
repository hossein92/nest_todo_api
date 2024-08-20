import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Todo } from './schemas/todo.schema';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { validateObjectId } from 'src/common/validation/validate-object-id.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class TodosService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(Todo.name) private readonly todoModel: Model<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto, user: User): Promise<Todo> {
    const data = { ...createTodoDto, user: user._id };
    // Invalidate related cache
    await this.cacheManager.del(`todos-${user._id}-*`);
    return this.todoModel.create(data);
  }

  async findAll(
    user: User,
    page: number,
    limit: number,
    status?: boolean,
    startDate?: string,
    endDate?: string,
  ): Promise<{ todos: Todo[]; total: number; totalPages: number }> {
    const cacheKey = `todos-${user._id}-${page}-${limit}-${status}-${startDate}-${endDate}`;

    // Try to get data from cache
    const cachedResult = await this.cacheManager.get<{
      todos: Todo[];
      total: number;
      totalPages: number;
    }>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    // If not found in cache, execute the query

    // Build the query object based on filters
    const query: any = { user: user._id };

    if (status !== undefined) {
      query.isCompleted = status;
    }

    if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    }

    if (endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    }

    const skip = (page - 1) * limit;

    const [todos, total] = await Promise.all([
      this.todoModel.find(query).skip(skip).limit(limit).exec(),
      this.todoModel.countDocuments({ user: user._id }).exec(),
    ]);
    const totalPages = Math.ceil(total / limit);
    const result = { todos, total, totalPages };

    // Store the result in cache
    await this.cacheManager.set(cacheKey, result, 300); // Cache for 300 seconds

    return result;
  }

  async findOne(id: string, user: User): Promise<Todo> {
    validateObjectId(id); // Validate ObjectId here

    const cacheKey = `todo-${id}-${user._id}`;

    // Try to get data from cache
    const cachedTodo = await this.cacheManager.get<Todo>(cacheKey);

    if (cachedTodo) {
      return cachedTodo;
    }

    const todo = await this.todoModel
      .findOne({ _id: id, user: user._id })
      .exec();
    if (!todo) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }

    // Store the result in cache
    await this.cacheManager.set(cacheKey, todo, 300); // Cache for 300 seconds

    return todo;
  }

  async update(
    id: string,
    updateTodoDto: UpdateTodoDto,
    user: User,
  ): Promise<Todo> {
    validateObjectId(id); // Validate ObjectId here

    const existTodo = await this.todoModel
      .findByIdAndUpdate({ _id: id, user: user._id }, updateTodoDto, {
        new: true,
      })
      .exec();

    if (!existTodo) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }

    // Invalidate related cache
    await this.cacheManager.del(`todo-${id}-${user._id}`);
    await this.cacheManager.del(`todos-${user._id}-*`);

    return existTodo;
  }

  async remove(id: string, user: User): Promise<Todo> {
    validateObjectId(id); // Validate ObjectId here
    const todo = await this.todoModel
      .findByIdAndDelete({ _id: id, user: user._id })
      .exec();
    if (!todo) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }

    // Invalidate related cache
    await this.cacheManager.del(`todo-${id}-${user._id}`);
    await this.cacheManager.del(`todos-${user._id}-*`);
    return todo;
  }
}
