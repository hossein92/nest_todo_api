import { Logger, Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { TodosModule } from './todos/todos.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CacheModule } from '@nestjs/cache-manager';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.test', '.env.stage', '.env.production'],
    }),
    // Cache configure
    CacheModule.register({
      ttl: 5, // seconds
      max: 100, // maximum number of items in cache
    }),
    // MongooseModule.forRoot(process.env.MONGO_URL),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoUrl = configService.get<string>('MONGO_URL');
        Logger.log(`Connecting to MongoDB at ${mongoUrl}`);
        return { uri: mongoUrl };
      },
      inject: [ConfigService],
    }),
    TodosModule,
    AuthModule,
    UsersModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
