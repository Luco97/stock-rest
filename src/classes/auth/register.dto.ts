import { IsEmail, MinLength } from 'class-validator';

export class Register {
  @IsEmail()
  email: string;

  @MinLength(5)
  username: string;

  @MinLength(7)
  password: string;
}
