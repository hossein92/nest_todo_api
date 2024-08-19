import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Todo } from './schemas/todo.schema';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { validateObjectId } from 'src/common/validation/validate-object-id.util';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto, user: User): Promise<Todo> {
    const data = { ...createTodoDto, user: user._id };
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
    return { todos, total, totalPages };
  }

  async findOne(id: string, user: User): Promise<Todo> {
    validateObjectId(id); // Validate ObjectId here
    const todo = await this.todoModel
      .findOne({ _id: id, user: user._id })
      .exec();
    if (!todo) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }
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
    return todo;
  }
}
