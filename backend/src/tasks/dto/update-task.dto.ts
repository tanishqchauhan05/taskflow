import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

// projectId is intentionally omitted — a task's project shouldn't change after creation.
export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['projectId'] as const),
) {}
