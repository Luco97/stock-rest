import {
  IsArray,
  IsInt,
  IsOptional,
  IsUrl,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateItem {
  @IsOptional()
  @Min(0)
  @Max(9999)
  price: number;

  @IsOptional()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @MinLength(5)
  description: string;

  @IsOptional()
  @IsUrl()
  imagesUrl: string;
}

export class UpdateTags {
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIDs: number[];
}
