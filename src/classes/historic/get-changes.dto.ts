import { IsDefined, IsNumber, IsOptional } from 'class-validator';

export class GetChanges {
  @IsDefined()
  @IsNumber()
  itemId: number;

  @IsOptional()
  @IsNumber()
  take: number;

  @IsOptional()
  @IsNumber()
  skip: number;

  @IsOptional()
  order: 'ASC' | 'DESC';
}
