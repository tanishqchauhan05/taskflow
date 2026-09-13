import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  create(dto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      project: { id: dto.projectId } as any,
      assignee: dto.assigneeId ? ({ id: dto.assigneeId } as any) : null,
    });
    return this.tasksRepository.save(task);
  }

  findAll(filters: { projectId?: string; assigneeId?: string }): Promise<Task[]> {
    const where: Record<string, unknown> = {};
    if (filters.projectId) where.project = { id: filters.projectId };
    if (filters.assigneeId) where.assignee = { id: filters.assigneeId };
    return this.tasksRepository.find({ where, relations: ['project'] });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['project'],
    });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.assigneeId !== undefined) {
      task.assignee = dto.assigneeId ? ({ id: dto.assigneeId } as any) : null;
    }
    return this.tasksRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const result = await this.tasksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task ${id} not found`);
    }
  }
}
