import {
  Res,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpStatus,
  Controller,
  SetMetadata,
  UseInterceptors,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { Register, SignIn } from '@dto/auth';
import { UserService } from '../services/user.service';
import { AlphanumericPipe } from '@shared/pipes';
import { GetTokenInterceptor } from '../interceptors/get-token.interceptor';
import { RoleGuard } from '../guards/role.guard';
import { Update } from '@dto/auth/update.dto';

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
      .then(({ message, status, token }) =>
        res.status(status).send({ status, message, token }),
      );
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

  @Post('reset-pass')
  @SetMetadata('roles', ['basic', 'admin', 'mod', 'master'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  update(
    @Headers('user_id') user_id: string,
    @Param('updatePassToken') updatePassToken: string,
    @Body() updateBody: Update,
    @Res() res: FastifyReply,
  ) {
    // const isValid: boolean = this._userService.validateToken(token, type);
    const { password } = updateBody;

    this._userService
      .updatePassword({
        user_id: +user_id,
        newPassword: password,
        updatePassToken,
      })
      .then((value) =>
        res.status(HttpStatus.OK).send({
          status: HttpStatus.OK,
          message: value ? 'user pass reset' : 'GTFO',
          // valid: isValid,
        }),
      );
  }

  @Post('confirm-pass')
  @SetMetadata('roles', ['basic', 'admin', 'mod', 'master'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  confirmPass(
    @Headers('user_name') username: string,
    @Body() updateBody: Update,
    @Res() res: FastifyReply,
  ) {
    const { password, email } = updateBody;

    if (!password || !email)
      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        message: 'this is anyone, we say he can but probably is any asshole',
      });
    else
      this._userService
        .signIn({ email, password, username, resetPass: true })
        .then(({ status, valid, updatePassToken }) =>
          res.status(status).send({
            status,
            message: valid
              ? 'valid to reset password (imagine it come from mail)'
              : 'valid to reset password (this is anyone, we say he can but probably is any asshole)',
            valid,
            updatePassToken,
          }),
        );
  }

  @Get(['', 'list'])
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
