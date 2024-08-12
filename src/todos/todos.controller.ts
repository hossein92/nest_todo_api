import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './schemas/todo.schema';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/schemas/user.schema';
import { QueryTodosDto } from './dto/query-todos.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@UseGuards(AuthGuard())
@ApiBearerAuth('access-token')
@ApiTags('Todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ description: 'Create a todo.' })
  @ApiCreatedResponse({
    description: 'The todo has been successfully created.',
    type: Todo,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @GetUser() user: User,
  ): Promise<Todo> {
    return this.todosService.create(createTodoDto, user);
  }

  @Get()
  @ApiOperation({ description: 'Get all Todo' })
  @ApiOkResponse({
    description: 'The Todo were successfully obtained.',
    type: [Todo],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of todos per page',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description:
      'Filter by completion status (true for completed, false for incomplete)',
    type: Boolean,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter todos created on or after this date (YYYY-MM-DD)',
    type: String,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter todos created on or before this date (YYYY-MM-DD)',
    type: String,
    example: '2024-08-12',
  })
  async findAll(@GetUser() user: User, @Query() query: QueryTodosDto) {
    const queryObject = plainToInstance(QueryTodosDto, query);

    const errors = await validate(queryObject);
    if (errors.length > 0) {
      throw new BadRequestException('Invalid query parameters');
    }

    const { page, limit, status, startDate, endDate } = queryObject;

    const result = await this.todosService.findAll(
      user,
      page,
      limit,
      status,
      startDate,
      endDate,
    );
    const nextPage = page < result.totalPages ? +page + 1 : null;
    const previousPage = page > 1 ? +page - 1 : null;

    return {
      todos: result.todos,
      total: result.total,
      totalPages: result.totalPages,
      page,
      limit,
      nextPage,
      previousPage,
    };
  }

  @Get(':id')
  @ApiOperation({
    description: 'Get a Todo by Id.',
  })
  @ApiOkResponse({
    description: 'The Todo was successfully obtained.',
    type: Todo,
  })
  async findOne(@Param('id') id: string, @GetUser() user: User): Promise<Todo> {
    return this.todosService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({
    description: 'Update a Todo by userId.',
  })
  @ApiOkResponse({
    description: 'The todo was successfully updated.',
    type: Todo,
  })
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @GetUser() user: User,
  ): Promise<Todo> {
    return this.todosService.update(id, updateTodoDto, user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: User): Promise<Todo> {
    return this.todosService.remove(id, user);
  }
}
