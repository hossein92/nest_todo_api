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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/schemas/user.schema';
import { QueryTodosDto } from './dto/query-todos.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidateObjectId } from 'src/common/validation/validate-object-id.pipe';

@ApiBearerAuth('access-token') // Add bearer token authentication to Swagger
@ApiTags('Todos') // Tag for grouping all `/todos` routes
@Controller('todos') // Define the `TodosController`
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  // Create a new Todo
  @Post()
  @UseGuards(AuthGuard())
  @ApiOperation({ description: 'Create a new todo item.' })
  @ApiCreatedResponse({
    description: 'The todo has been successfully created.',
    type: Todo,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid title or other bad request error',
    schema: {
      example: {
        statusCode: 400,
        message: 'title should not be empty, title must be a string',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @GetUser() user: User,
  ): Promise<Todo> {
    return this.todosService.create(createTodoDto, user);
  }

  // Get a list of Todos with optional pagination and filters
  @Get()
  @UseGuards(AuthGuard())
  @ApiOperation({
    description:
      'Retrieve all todo items with optional pagination and filtering.',
  })
  @ApiOkResponse({
    description: 'The todos were successfully retrieved.',
    type: [Todo],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination (default: 1).',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of todos per page (default: 10).',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description:
      'Filter by completion status (true for completed, false for incomplete).',
    type: Boolean,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter todos created on or after this date (YYYY-MM-DD).',
    type: String,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter todos created on or before this date (YYYY-MM-DD).',
    type: String,
    example: '2024-12-31',
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
    const nextPage = page < result.totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

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

  // Get a specific Todo by its ID
  @Get(':id')
  @UseGuards(AuthGuard())
  @ApiOperation({ description: 'Retrieve a specific todo item by its ID.' })
  @ApiOkResponse({
    description: 'The todo was successfully retrieved.',
    type: Todo,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format or other bad request error',
    schema: {
      example: {
        status: 400,
        message: '932794 is not a valid ObjectId',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Todo with ID "66ba1416ba207f7f664e106b" not found',
      },
    },
  })
  @UsePipes(ValidateObjectId)
  async findOne(@Param('id') id: string, @GetUser() user: User): Promise<Todo> {
    return this.todosService.findOne(id, user);
  }

  // Update a specific Todo by its ID
  @Patch(':id')
  @UseGuards(AuthGuard())
  @ApiOperation({ description: 'Update a specific todo item by its ID.' })
  @ApiOkResponse({
    description: 'The todo was successfully updated.',
    type: Todo,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format or other bad request error',
    schema: {
      example: {
        status: 400,
        message: '932794 is not a valid ObjectId',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Todo with ID "66ba1416ba207f7f664e106b" not found',
      },
    },
  })
  @UsePipes(ValidateObjectId)
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @GetUser() user: User,
  ): Promise<Todo> {
    return this.todosService.update(id, updateTodoDto, user);
  }

  // Delete a specific Todo by its ID
  @Delete(':id')
  @UseGuards(AuthGuard())
  @ApiOperation({ description: 'Delete a specific todo item by its ID.' })
  @ApiOkResponse({
    description: 'The todo was successfully deleted.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format or other bad request error',
    schema: {
      example: {
        status: 400,
        message: '932794 is not a valid ObjectId',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Todo with ID "66ba1416ba207f7f664e106b" not found',
      },
    },
  })
  @UsePipes(ValidateObjectId)
  async remove(@Param('id') id: string, @GetUser() user: User): Promise<Todo> {
    return this.todosService.remove(id, user);
  }
}
