import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { TaskStatus } from '../../common/enums/task-status.enum';

export class CreateTaskDto {
  @ApiProperty({ example: 'Design homepage wireframes' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Low-fi wireframes for desktop and mobile' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'a3f1c2e4-...', description: 'ID of the project this task belongs to' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ example: 'b7e2d1a0-...', description: 'ID of the user to assign this task to' })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
