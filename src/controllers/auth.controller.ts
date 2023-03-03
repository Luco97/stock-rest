import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { Register, SignIn } from '@dto/auth';
import { UserRepoService } from '@models/user';
import { compare } from 'bcrypt';
import { AuthService } from '@shared/auth';

@Controller('auth')
export class AuthController {
  constructor(
    private _userRepo: UserRepoService,
    private _authService: AuthService,
  ) {}

  @Post('register') registerUser(
    @Body() register_user: Register,
    @Res() res: FastifyReply,
  ) {
    const { email, password, username } = register_user;

    this._userRepo
      .findUser({ email, username: username.toLowerCase() })
      .then((user) => {
        if (user)
          res
            .status(HttpStatus.OK)
            .send({ status: HttpStatus.OK, message: 'already exist' });
        else
          this._userRepo
            .create({ email, password, username })
            .then(() =>
              res
                .status(HttpStatus.OK)
                .send({ status: HttpStatus.OK, message: 'user created' }),
            );
      });
  }

  @Post('sign') signIn(@Body() sign_user: SignIn, @Res() res: FastifyReply) {
    const { email, password } = sign_user;

    this._userRepo.findUser({ email, username: ' ' }).then((user) => {
      if (!user)
        res
          .status(HttpStatus.OK)
          .send({ status: HttpStatus.OK, message: `user doesn't exist` });
      else {
        compare(password, user.password).then((isValid) => {
          if (!isValid)
            res
              .status(HttpStatus.OK)
              .send({ status: HttpStatus.OK, message: `user doesn't exist` });
          else
            res.status(HttpStatus.OK).send({
              status: HttpStatus.OK,
              message: 'user logged',
              token: this._authService.genJWT({
                id: user.id,
                name: user.username,
                type: user.type,
              }),
            });
        });
      }
    });
  }
}
