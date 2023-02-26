import { IsDefined, MinLength } from 'class-validator';

export class CreateTag {
  @IsDefined()
  @MinLength(4)
  name: string;

  @IsDefined()
  @MinLength(5)
  description: string;
}
