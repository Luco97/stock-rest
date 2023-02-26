import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateInput {
  @Min(1)
  id_item: number;
}

export class Update {
  @Min(1)
  id_item: number;

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
  name: string;
}

export class UpdateTags {
  @Min(1)
  id_item: number;

  @IsArray()
  @ArrayMinSize(1)
  tags_id: number[];
}
