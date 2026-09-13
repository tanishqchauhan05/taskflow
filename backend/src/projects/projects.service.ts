import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Role } from '../common/enums/role.enum';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  create(dto: CreateProjectDto, owner: AuthUser): Promise<Project> {
    const project = this.projectsRepository.create({
      ...dto,
      owner: { id: owner.id } as any,
    });
    return this.projectsRepository.save(project);
  }

  findAll(): Promise<Project[]> {
    return this.projectsRepository.find({ relations: ['tasks'] });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    requester: AuthUser,
  ): Promise<Project> {
    const project = await this.findOne(id);
    this.assertCanModify(project, requester);
    Object.assign(project, dto);
    return this.projectsRepository.save(project);
  }

  async remove(id: string, requester: AuthUser): Promise<void> {
    const project = await this.findOne(id);
    this.assertCanModify(project, requester);
    await this.projectsRepository.remove(project);
  }

  // Only the project's owner, a manager, or an admin may edit/delete it.
  private assertCanModify(project: Project, requester: AuthUser) {
    const isOwner = project.owner?.id === requester.id;
    const isPrivileged =
      requester.role === Role.ADMIN || requester.role === Role.MANAGER;
    if (!isOwner && !isPrivileged) {
      throw new ForbiddenException(
        'You do not have permission to modify this project',
      );
    }
  }
}
