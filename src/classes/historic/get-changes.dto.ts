import { IsDefined, IsNumber, IsOptional, Min } from 'class-validator';

export class GetChanges {
  @IsDefined()
  @IsNumber()
  @Min(1)
  itemId: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  take: number;

  @IsOptional()
  @IsNumber()
  skip: number;

  @IsOptional()
  order: 'ASC' | 'DESC';
}
