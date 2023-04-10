import { HttpStatus, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';

import { AuthService } from '@shared/auth';
import { UserItemsCount, UserRepoService } from '@models/user';

@Injectable()
export class UserService {
  constructor(
    private _authService: AuthService,
    private _userRepo: UserRepoService,
  ) {}

  register(params: {
    email: string;
    password: string;
    username: string;
  }): Promise<boolean> {
    const { email, password, username } = params;

    return new Promise<boolean>((resolve, reject) => {
      this._userRepo
        .findUser({ email, username: username.toLowerCase() })
        .then((user) => {
          if (user) resolve(false);
          else
            this._userRepo
              .create({ email, password, username })
              .then(() => resolve(true));
        });
    });
  }

  signIn(params: {
    email: string;
    username?: string;
    password: string;
    resetPass?: boolean;
  }): Promise<{
    statusCode: number;
    message: string;
    token?: string;
    valid?: boolean;
    updatePassToken?: string;
  }> {
    const { email, password, username, resetPass } = params;

    return new Promise<{
      statusCode: number;
      message: string;
      token?: string;
      valid?: boolean;
      updatePassToken?: string;
    }>((resolve, reject) =>
      this._userRepo
        .findUser({ email, username: username || '' })
        .then((user) => {
          if (!user)
            resolve({ statusCode: HttpStatus.OK, message: `user doesn't exist` });
          else {
            if (resetPass)
              resolve({
                statusCode: HttpStatus.OK,
                message: 'user logged',
                valid: true,
                updatePassToken: this._authService.genJWT(
                  {
                    id: user.id,
                    name: user.username,
                    type: 'PASS_UPDATE',
                  },
                  { expiresIn: '3h' },
                ),
              });
            else
              compare(password, user.password).then((isValid) => {
                if (!isValid)
                  resolve({
                    statusCode: HttpStatus.OK,
                    message: `user doesn't exist`,
                    valid: isValid,
                  });
                else {
                  resolve({
                    statusCode: HttpStatus.OK,
                    message: 'user logged',
                    token: this._authService.genJWT({
                      id: user.id,
                      name: user.username,
                      type: user.type,
                    }),
                    valid: isValid,
                    updatePassToken: this._authService.genJWT(
                      {
                        id: user.id,
                        name: user.username,
                        type: 'PASS_UPDATE',
                      },
                      { expiresIn: '3h' },
                    ),
                  });
                }
              });
          }
        }),
    );
  }

  validateToken(token: string, type?: string): boolean {
    return this._authService.validateToken(token, type);
  }

  findAll(params: {
    take: number;
    skip: number;
    term: string;
  }): Promise<[UserItemsCount[], number]> {
    const { skip, take, term } = params;

    return this._userRepo.findAll({
      take: take || 10,
      skip: skip || 0,
      username: term,
    });
  }

  updatePassword(params: {
    user_id: number;
    updatePassToken: string;
    newPassword: string;
  }): Promise<number> {
    const { newPassword, user_id, updatePassToken } = params;

    const { id, type } = this._authService.getContext(updatePassToken);

    // No es token para update de password
    if (type != 'PASS_UPDATE')
      return new Promise<number>((resolve) => resolve(0));
    // usuario que pasa el guardia no utiliza mismo token para crear
    // nueva contraseña (juanito no puede cambiarle la contraseña a pedrito)
    if (user_id != id) return new Promise<number>((resolve) => resolve(0));
    return this._userRepo.updatePass(user_id, newPassword);
  }

  updateType(params: { user_id: number; type: string }) {
    const { type, user_id } = params;

    return this._userRepo.updateType(user_id, type);
  }
}
