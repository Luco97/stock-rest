import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { UserModel } from './user-model';
import { UserTypes } from './user.enum';

@Injectable()
export class UserRepoService {
  constructor(
    @InjectRepository(UserModel)
    private readonly _userRepo: EntityRepository<UserModel>,
  ) {}

  countRoles(params: { userID: number; roles: string[] }): Promise<number> {
    const { roles, userID } = params;
    return this._userRepo
      .createQueryBuilder('user')
      .select(['user.id', 'user.type'])
      .where({
        $and: [{ 'user.id': userID }, { 'user.type': { $in: roles } }],
      })
      .getCount();
  }

  create(params: { email: string; username: string; password: string }) {
    const { email, password, username } = params;
    return this._userRepo.persistAndFlush(
      this._userRepo.create({
        email,
        username,
        password,
        type: UserTypes.BASIC,
      }),
    );
  }

  findUser(params: { email: string; username: string }): Promise<UserModel> {
    const { email, username } = params;

    return this._userRepo
      .createQueryBuilder('user')
      .select([
        'user.id', // error if 'id' is not select
        'user.email',
        'user.password',
        'user.username',
        'user.type',
      ])
      .where({
        $or: [
          { 'user.email': email },
          { 'lower("user"."username")': username },
        ],
      })
      .getSingleResult();
  }
}
