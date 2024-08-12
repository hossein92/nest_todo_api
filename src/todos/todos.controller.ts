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
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './schemas/todo.schema';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

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
  async create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todosService.create(createTodoDto);
  }

  @Get()
  @ApiOperation({ description: 'Get all Todo' })
  @ApiOkResponse({
    description: 'The Todo were successfully obtained.',
    type: [Todo],
  })
  async findAll(): Promise<Todo[]> {
    return this.todosService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    description: 'Get a Todo by Id.',
  })
  @ApiOkResponse({
    description: 'The Todo was successfully obtained.',
    type: Todo,
  })
  async findOne(@Param('id') id: string): Promise<Todo> {
    return this.todosService.findOne(id);
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
  ): Promise<Todo> {
    return this.todosService.update(id, updateTodoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Todo> {
    return this.todosService.remove(id);
  }
}
