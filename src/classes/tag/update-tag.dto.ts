import { IsOptional, MinLength } from 'class-validator';

export class UpdateTags {
  @IsOptional()
  @MinLength(5)
  description: string;
}
