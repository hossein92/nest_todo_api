import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { TodosModule } from './todos/todos.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    TodosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
