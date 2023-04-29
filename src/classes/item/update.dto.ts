import {
  IsArray,
  IsInt,
  IsOptional,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateItem {
  @IsOptional()
  @Min(0)
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
  @IsArray()
  @IsUrl({}, { each: true })
  imagesUrl: string[];
}

export class UpdateTags {
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIDs: number[];
}

export class UpdateImages {
  @IsArray()
  @IsUrl({}, { each: true })
  imagesUrl: string[];
}
