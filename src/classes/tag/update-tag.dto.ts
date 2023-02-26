import { IsOptional, Min, MinLength } from 'class-validator';

export class UpdateTags {
  @Min(1)
  id_tag: number;

  @IsOptional()
  @MinLength(5)
  description: string;
}
