import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from 'src/app.module';

describe('AuthController (e2e)', () => {
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

  describe('/auth/signup (POST)', () => {
    it('should sign up a new user and return a token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
    });

    it('should return 409 if the user already exists', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test2@example.com',
          password: 'TestPassword123!',
          name: 'Test User',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test2@example.com',
          password: 'TestPassword123!',
          name: 'Test User',
        })
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should log in an existing user and return a token', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'loginuser@example.com',
          password: 'LoginPassword123!',
          name: 'Login User',
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'loginuser@example.com',
          password: 'LoginPassword123!',
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
    });

    it('should return 401 if credentials are invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invaliduser@example.com',
          password: 'InvalidPassword123!',
        })
        .expect(401);
    });
  });
});
