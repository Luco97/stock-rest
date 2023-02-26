import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetItems {
  @IsOptional()
  @IsNumber()
  take: number;

  @IsOptional()
  @IsNumber()
  skip: number;

  @IsOptional()
  @IsString()
  orderBy: string;

  @IsOptional()
  @IsString()
  order: 'ASC' | 'DESC';
}
