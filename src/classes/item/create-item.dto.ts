import { IsDefined, Min, MinLength } from 'class-validator';

export class CreateItem {
  @IsDefined()
  @MinLength(5)
  name: string;

  @IsDefined()
  @Min(0)
  stock: number;

  @IsDefined()
  @Min(0)
  price: number;
}
