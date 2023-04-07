import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  Logger,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.model';
import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTaskDTO } from './dto/get-task.dto';
import { UpdateTaskStatusDTO } from './dto/update-task-status-dto';
import { UseGuards } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user-decorator';
import { User } from '../auth/user.entity';
import { ConfigService } from '@nestjs/config';

// @Controller('tasks')
// export class TasksController {
//   constructor(private taskService: TasksService) {}

// @Get()
// getAllTasks(): Task[] {
//   return this.taskService.getAllTasks();
// }

// @Get()
// getTasks(@Query() filterDTO: GetTaskDTO): Task[] {
//   if (Object.keys(filterDTO).length > 0) {
//     return this.taskService.getTasksWithFilters(filterDTO);
//   } else return this.taskService.getAllTasks();
// }

// @Get('/:id')
// getTaskById(@Param('id') id: string): Task {
//   return this.taskService.getTaskById(id);
// }

// @Post()
// createTask(
//   @Body('title') title: string,
//   @Body('description') description: string,
// ): Task {
//   return this.taskService.createTask(title, description);
// }

// @Post()
// createTask(@Body() createTaskDTO: CreateTaskDTO): Task {
//   return this.taskService.createTask(createTaskDTO);
// }

// @Delete('/:id')
// deleteTask(@Param('id') id: string): void {
//   return this.taskService.deleteTask(id);
// }

// @Patch(':id/status')
// updateTaskStatus(
//   @Param('id') id: string,
//   @Body() updateTaskStatusDTO: UpdateTaskStatusDTO,
// ): Task {
//   const { status } = updateTaskStatusDTO;
//   return this.taskService.udateTaskStatus(id, status);
// }
// }

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger= new Logger(`TasksController`);
  constructor(
    private taskService: TasksService,
    private configService: ConfigService
    ) {
      // console.log(this.configService.get('TEST_DATA'))
    }

  @Get('/:id')
  getTaskById(@Param('id') id: string, @GetUser() user:User): Promise<Task> {
    this.logger.verbose(`User ${user.username} is trying to retrieve task by id: ${id}`)
    return this.taskService.getTaskById(id, user);
  }

  @Post()
  createTask(@Body() createTaskDTO: CreateTaskDTO, @GetUser() user:User): Promise<Task> {
    this.logger.verbose(`User ${user.username} is trying to create a task: ${JSON.stringify(createTaskDTO)}`)
    return this.taskService.createTask(createTaskDTO, user);
  }

  @Delete('/:id')
  deleteTask(@Param('id') id: string, user:User): Promise<void> {
    return this.taskService.deleteTask(id, user);
  }

  @Patch(':id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDTO: UpdateTaskStatusDTO,
    @GetUser() user: User
  ): Promise<Task> {
    const { status } = updateTaskStatusDTO;
    return this.taskService.udateTaskStatus(id, status, user);
  }

  @Get()
  getTasks(@Query() filterDTO: GetTaskDTO, @GetUser() user:User): Promise<Task[]> {
    this.logger.verbose(`User ${user.username} is trying to retrieve all the tasks by filters ${JSON.stringify(filterDTO)}`)
    return this.taskService.getTasksWithFilters(filterDTO, user);
  }
}
