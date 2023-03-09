import { HttpStatus, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';

import { AuthService } from '@shared/auth';
import { UserRepoService } from '@models/user';

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
    password: string;
  }): Promise<{ status: number; message: string; token?: string }> {
    const { email, password } = params;

    return new Promise<{ status: number; message: string; token?: string }>(
      (resolve, reject) =>
        this._userRepo.findUser({ email, username: ' ' }).then((user) => {
          if (!user)
            resolve({ status: HttpStatus.OK, message: `user doesn't exist` });
          else {
            compare(password, user.password).then((isValid) => {
              if (!isValid)
                resolve({
                  status: HttpStatus.OK,
                  message: `user doesn't exist`,
                });
              else
                resolve({
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
        }),
    );
  }
}
