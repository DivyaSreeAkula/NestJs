import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task-entity';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
  ConfigModule,
  TypeOrmModule.forFeature([Task]), 
  AuthModule,
  PassportModule.register({ defaultStrategy: 'jwt' }),
],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
