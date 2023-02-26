import { IsEmail, MinLength } from 'class-validator';

export class Register {
  @IsEmail()
  email: string;

  @MinLength(5)
  username: string;

  password: string;
}
