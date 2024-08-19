import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Todo } from '../src/todos/schemas/todo.schema';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

interface TodoWithId extends Todo {
  _id: string;
}

describe('TodosController (e2e)', () => {
  let app: INestApplication;
  let dbConnection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    dbConnection = app.get(getConnectionToken());
    await app.init();
  });

  afterAll(async () => {
    await dbConnection.dropDatabase(); // Clean up the database
    await app.close();
  });

  let token: string;
  const testUser = {
    email: 'testuser@example.com',
    password: 'TestPassword123!',
  };

  it('should sign up a new user and return a JWT token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser)
      .expect(201);

    token = res.body.token;
    expect(token).toBeDefined();
  });

  it('should create a new todo', async () => {
    const createTodoDto = {
      title: 'Test Todo',
      description: 'Test Description',
      isCompleted: false,
    };

    const res = await request(app.getHttpServer())
      .post('/todos')
      .set('Authorization', `Bearer ${token}`)
      .send(createTodoDto)
      .expect(201);

    const createdTodo: Todo = res.body;
    expect(createdTodo.title).toBe(createTodoDto.title);
    expect(createdTodo.description).toBe(createTodoDto.description);
  });

  it('should get all todos', async () => {
    const res = await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const todos: Todo[] = res.body.todos;
    expect(Array.isArray(todos)).toBe(true);
    expect(todos.length).toBeGreaterThan(0);
  });

  it('should get a specific todo by ID', async () => {
    const res = await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const todoId = res.body.todos[0]._id;

    const todoRes = await request(app.getHttpServer())
      .get(`/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const todo: TodoWithId = todoRes.body;
    expect(todo._id).toBe(todoId);
  });

  it('should update a specific todo', async () => {
    const res = await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const todoId = res.body.todos[0]._id;

    const updateTodoDto = { title: 'Updated Test Todo' };

    const updateRes = await request(app.getHttpServer())
      .patch(`/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateTodoDto)
      .expect(200);

    const updatedTodo: Todo = updateRes.body;
    expect(updatedTodo.title).toBe(updateTodoDto.title);
  });

  it('should delete a specific todo', async () => {
    const res = await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const todoId = res.body.todos[0]._id;

    await request(app.getHttpServer())
      .delete(`/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
