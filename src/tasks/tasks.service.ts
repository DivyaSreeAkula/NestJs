import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task-entity';
import { Repository } from 'typeorm';
import { TaskStatus } from './task.model';
import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTaskDTO } from './dto/get-task.dto';
import { User } from '../auth/user.entity';

// import { Task, TaskStatus } from './task.model';
// import { v4 as uuid } from 'uuid';
// import { CreateTaskDTO } from './dto/create-task.dto';
// import { GetTaskDTO } from './dto/get-task.dto';
// @Injectable()
// export class TasksService {
// private tasks: Task[] = [];
// getAllTasks = (): Task[] => {
//   return this.tasks;
// };
// getTasksWithFilters = (filterDTO: GetTaskDTO): Task[] => {
//   let tasks: Task[] = this.getAllTasks();
//   const { status, search } = filterDTO;
//   //If status is present
//   if (status) tasks = tasks.filter((task) => task.status == status);
//   //if search is present
//   if (search)
//     tasks = tasks.filter(
//       (task) =>
//         task.title.includes(search) || task.description.includes(search),
//     );
//   return tasks;
// };
// createTask = (createTaskDTO: CreateTaskDTO): Task => {
//   const { title, description } = createTaskDTO;
//   const task: Task = {
//     id: uuid(),
//     title,
//     description,
//     status: TaskStatus.OPEN,
//   };
//   this.tasks.push(task);
//   return task;
// };
// getTaskById = (id: string): Task => {
//   const found = this.tasks.find((task) => task.id === id);
//   if (!found) throw new NotFoundException(`task with id: ${id} is not found`);
//   return found;
// };
// deleteTask = (id: string): void => {
//   //check whether the task exists, if not throw an error, which is handled in the getTaskById
//   this.getTaskById(id);
//   this.tasks = this.tasks.filter((task) => task.id !== id);
// };
// udateTaskStatus = (id: string, status: TaskStatus): Task => {
//   const task = this.getTaskById(id);
//   task.status = status;
//   return task;
// };
// }

@Injectable()
export class TasksService {
  private logger= new Logger(`TaskService`)

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async getTaskById(id: string, user:User): Promise<Task> {
    const found = await this.taskRepository.findOne({ where: { id: id, user } });
    if (!found) throw new NotFoundException(`task with id: ${id} is not found`);
    return found;
  }

  async createTask(createTaskDTO: CreateTaskDTO, user:User): Promise<Task> {
    const { title, description } = createTaskDTO;
    const task = this.taskRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user
    });
    await this.taskRepository.save(task);
    return task;
  }

  async deleteTask(id: string, user:User): Promise<void> {
    //check whether the task exists, if not throw an error, which is handled in the getTaskById
    // this.getTaskById(id);
    // await this.taskRepository.delete(id); or
    const result = await this.taskRepository.delete({id, user});
    if (result.affected === 0)
      throw new NotFoundException(`task with id: ${id} is not found`);
  }

  async udateTaskStatus(id: string, status: TaskStatus, user:User): Promise<Task> {
    const task = await this.getTaskById(id, user);
    await this.taskRepository.update(id, { status });
    task.status = status;
    return task;
  }

  async getTasksWithFilters(filterDTO: GetTaskDTO, user:User): Promise<Task[]> {
    const query = this.taskRepository.createQueryBuilder('task');
    query.where({user})
    const { status, search } = filterDTO;

    //If status is present
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    //if search is present
    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }
    console.log(query.getQueryAndParameters());
    try{
    const tasks = await query.getMany();
    return tasks;
    }catch(err){
      this.logger.error(`User ${user.username} is throwing an error 
      with filter: ${JSON.stringify(filterDTO)}`, err.stack)
      throw new InternalServerErrorException()
    }
  }
}
