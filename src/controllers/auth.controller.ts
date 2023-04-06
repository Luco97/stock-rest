import {
  Res,
  Get,
  Query,
  Post,
  Body,
  Param,
  Headers,
  HttpStatus,
  Controller,
  SetMetadata,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { Register, SignIn } from '@dto/auth';
import { UserService } from '../services/user.service';
import { AlphanumericPipe } from '@shared/pipes';

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

  @Post(['validate-token', 'validate-token/:type'])
  validateToken(
    @Headers('Authorization') token: string,
    @Param('type') type: string,
    @Res() res: FastifyReply,
  ) {
    const isValid: boolean = this._userService.validateToken(token, type);
    res.status(HttpStatus.OK).send({
      status: HttpStatus.OK,
      message: isValid ? 'user valid' : 'GTFO',
      valid: isValid,
    });
  }

  @Get()
  @SetMetadata('roles', ['mod', 'master'])
  findAll(
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Query('term', AlphanumericPipe) term: string,
    @Res() res: FastifyReply,
  ) {
    this._userService
      .findAll({ skip: +skip, take: +take, term })
      .then(([users, count]) =>
        res
          .status(HttpStatus.OK)
          .send({ users, count, message: `users found: ${count}` }),
      );
  }
}
