import { IsEmail, MinLength } from 'class-validator';

export class SignIn {
  @IsEmail()
  email: string;

  @MinLength(5)
  password: string;
}
