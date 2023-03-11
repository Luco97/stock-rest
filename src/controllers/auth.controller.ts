import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { Register, SignIn } from '@dto/auth';
import { UserService } from '../services/user.service';

@Controller('auth')
export class AuthController {
  constructor(private _userService: UserService) {}

  @Post('register') registerUser(
    @Body() register_user: Register,
    @Res() res: FastifyReply,
  ) {
    const { email, password, username } = register_user;
    this._userService.register({ email, password, username }).then((isValid) =>
      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        message: isValid ? 'user created' : 'already exist',
      }),
    );
  }

  @Post('sign-in') signIn(@Body() sign_user: SignIn, @Res() res: FastifyReply) {
    const { email, password } = sign_user;

    this._userService
      .signIn({ email, password })
      .then((response) => res.status(response.status).send(response));
  }
}
