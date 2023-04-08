import { IsEmail, IsOptional, MinLength } from 'class-validator';

export class Update {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @MinLength(7)
  password: string;
}
