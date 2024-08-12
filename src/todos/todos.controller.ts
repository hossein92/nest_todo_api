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
  Req,
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

@ApiTags('Todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('access-token')
  @ApiOperation({ description: 'Create a todo.' })
  @ApiCreatedResponse({
    description: 'The todo has been successfully created.',
    type: Todo,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @Req() req: any,
  ): Promise<Todo> {
    return this.todosService.create(createTodoDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('access-token')
  @ApiOperation({ description: 'Get all Todo' })
  @ApiOkResponse({
    description: 'The Todo were successfully obtained.',
    type: [Todo],
  })
  async findAll(): Promise<Todo[]> {
    return this.todosService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('access-token')
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
  @UseGuards(AuthGuard())
  @ApiBearerAuth('access-token')
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
