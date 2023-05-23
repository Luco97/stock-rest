import {
  IsDefined,
  IsHexColor,
  IsOptional,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateItem {
  @IsDefined()
  @MinLength(5)
  name: string;

  @IsDefined()
  @Min(0)
  stock: number;

  @IsDefined()
  @Min(0)
  @Max(9999)
  price: number;

  @IsOptional()
  @MinLength(5)
  description: string;

  @IsOptional()
  @IsHexColor()
  colorTheme: string;
}
