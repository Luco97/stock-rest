import {
  Put,
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
  ParseIntPipe,
  ParseEnumPipe,
  UseInterceptors,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { Update } from '@dto/auth/update.dto';
import { Register, SignIn } from '@dto/auth';
import { AlphanumericPipe } from '@shared/pipes';
import { UserTypes, UserTypesOptionsEnum } from '@models/user';
import { RoleGuard } from '../guards/role.guard';
import { UserService } from '../services/user.service';
import { GetTokenInterceptor } from '../interceptors/get-token.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private _userService: UserService) {}

  @Post('register') registerUser(
    @Body() register_user: Register,
    @Res() res: FastifyReply,
  ) {
    const { email, password, username } = register_user;
    this._userService
      .register({ email, password, username })
      .then((isValid) => {
        const statusCode: number = isValid
          ? HttpStatus.OK
          : HttpStatus.UNAUTHORIZED;
        res.status(statusCode).send({
          statusCode,
          message: isValid ? 'user created' : 'already exist',
        });
      });
  }

  @Post('sign-in') signIn(@Body() sign_user: SignIn, @Res() res: FastifyReply) {
    const { email, password } = sign_user;

    this._userService
      .signIn({ email, password })
      .then(({ message, statusCode, token }) =>
        res.status(statusCode).send({ statusCode, message, token }),
      );
  }

  // work also for password reset type = 'PASS_UPDATE'
  @Post(['validate-token', 'validate-token/:type'])
  validateToken(
    @Headers('Authorization') token: string,
    @Param('type') type: string,
    @Res() res: FastifyReply,
  ) {
    const isValid: boolean = this._userService.validateToken(token, type);
    const statusCode: number = isValid
      ? HttpStatus.OK
      : HttpStatus.UNAUTHORIZED;
    res.status(statusCode).send({
      statusCode,
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
    @Query('updatePassToken') updatePassToken: string,
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
          statusCode: HttpStatus.OK,
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
        statusCode: HttpStatus.OK,
        message: 'this is anyone',
      });
    else
      this._userService
        .signIn({ email, password, username, resetPass: true })
        .then(({ statusCode, valid, updatePassToken }) =>
          res.status(statusCode).send({
            statusCode,
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
  @UseGuards(RoleGuard)
  findAll(
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Query('term', AlphanumericPipe) term: string,
    @Res() res: FastifyReply,
  ) {
    this._userService
      .findAll({ skip: +skip, take: +take, term })
      .then(([users, count]) =>
        res.status(HttpStatus.OK).send({
          statusCode: HttpStatus.OK,
          users,
          count,
          message: `users found: ${count}`,
        }),
      );
  }

  @Put(':id/update/:type')
  @SetMetadata('roles', ['mod', 'master'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  updateType(
    @Headers('user_type') userType: string,
    @Param('id', ParseIntPipe) id: number,
    @Param('type', new ParseEnumPipe(UserTypesOptionsEnum))
    type: string,
    @Res() res: FastifyReply,
  ) {
    // master hace la wea que quiera
    if (
      userType == 'mod' &&
      ![UserTypes.ADMIN.toString(), UserTypes.BASIC.toString()].includes(type)
    )
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .send({ statusCode: HttpStatus.NOT_ACCEPTABLE, message: 'not valid' });
    return this._userService
      .updateType({ user_id: id, type })
      .then((hurtRows) =>
        res
          .status(HttpStatus.OK)
          .send({ statusCode: HttpStatus.OK, message: hurtRows ? '' : '' }),
      );
  }
}
