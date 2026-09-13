import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Redesign' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Revamp the marketing site for Q4 launch' })
  @IsOptional()
  @IsString()
  description?: string;
}
