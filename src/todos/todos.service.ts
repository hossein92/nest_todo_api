import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Todo } from './schemas/todo.schema';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto, user: User): Promise<Todo> {
    const data = Object.assign(createTodoDto, { user: user._id });
    const createTodo = new this.todoModel(data);
    return createTodo.save();
  }

  async findAll(
    user: User,
    page: number,
    limit: number,
  ): Promise<{ todos: Todo[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [todos, total] = await Promise.all([
      this.todoModel.find({ user: user._id }).skip(skip).limit(limit).exec(),
      this.todoModel.countDocuments({ user: user._id }).exec(),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { todos, total, totalPages };
  }

  async findOne(id: string, user: User): Promise<Todo> {
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
    const todo = await this.todoModel
      .findByIdAndDelete({ _id: id, user: user._id })
      .exec();
    if (!todo) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }
    return todo;
  }
}
