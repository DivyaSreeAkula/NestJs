import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm/repository/Repository';
import { Task } from './task-entity';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskStatus } from './task.model';
import { NotFoundException } from '@nestjs/common';

const mockTaskRepository = () => ({
  findOne: jest.fn()
});
let taskService: TasksService;
let taskRepository: Repository<Task>;

describe('TaskService', () => {
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useFactory: mockTaskRepository,
        },
      ],
    }).compile();
    taskService = module.get<TasksService>(TasksService);
    taskRepository= module.get<Repository<Task>>(getRepositoryToken(Task))
  });
  describe('getTaskById', () => {
    it('calls TaskService.getTaskById and returns the result', async () => {
      const mockTask = {
        title: 'test title',
        description: 'Test Desc',
        id: 'some Id',
        status: TaskStatus.OPEN,
        user:null
      };
      const mockTask1 = {
        title: 'test title',
        description: 'Test Desc',
        id: 'some Id',
        status: TaskStatus.OPEN,
        user:null
      };
      const mockUser={
        username: 'Ariel',
        id: 'someId',
        password:'somePassword',
        tasks:[mockTask1]
      }
      jest.spyOn(taskRepository, 'findOne').mockResolvedValueOnce(mockTask);
      const result = await taskService.getTaskById('someId',mockUser)
      expect(result).toEqual(mockTask)

    });

    it('calls TaskService.getTaskById returns an error', async () => {
      const mockUser={
        username: 'Ariel',
        id: 'someId',
        password:'somePassword',
        tasks:null
      }
      jest.spyOn(taskRepository, 'findOne').mockResolvedValueOnce(null);
      expect(taskService.getTaskById('123',mockUser)).rejects.toThrow(NotFoundException)
    });
  });
});
