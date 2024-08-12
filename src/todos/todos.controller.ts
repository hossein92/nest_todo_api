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
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/schemas/user.schema';

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
  @Get()
  async findAll(
    @GetUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.todosService.findAll(user, page, limit);
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
