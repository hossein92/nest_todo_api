import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ValidationError } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationException } from './common/filters/validation.exception';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // validation
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const messages = validationErrors.map(
          (error) => `${Object.values(error.constraints).join(', ')}`,
        );
        return new ValidationException(messages.join(', '));
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  // swagger setup
  const config = new DocumentBuilder()
    .setTitle('TODO App')
    .setDescription('The todo API ')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token', // This name will be used to reference this auth in the routes
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('open_api', app, document, {
    jsonDocumentUrl: 'open_api/json',
    swaggerOptions: {
      persistAuthorization: true, // This enables persistence in the session (Swagger feature)
    },
  });
  await app.listen(3000);
}
bootstrap();
