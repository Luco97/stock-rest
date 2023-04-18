import { Injectable } from '@nestjs/common';
import { QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { UserItemsCount, UserModel } from './user-model';
import { UserTypes, hashPass } from './user-const';

@Injectable()
export class UserRepoService {
  constructor(
    @InjectRepository(UserModel)
    private readonly _userRepo: EntityRepository<UserModel>,
    @InjectRepository(UserItemsCount)
    private readonly _userItemCountRepo: EntityRepository<UserItemsCount>,
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

  updatePass(user_id: number, password: string): Promise<number> {
    return new Promise<number>((resolve, reject) =>
      hashPass(password).then((newHashPass) =>
        this._userRepo
          .nativeUpdate({ id: user_id }, { password: newHashPass })
          .then((value) => resolve(value)),
      ),
    );
  }

  updateType(user_id: number, type: string): Promise<number> {
    return this._userRepo.nativeUpdate({ id: user_id }, { type });
  }

  // findAll para todos los usuarios, solo master no es considerado
  // master puede dar rol de mod y admin
  // mod puede dar rol de admin
  // admin es admin pero puede ver todo
  // basicos = SIGMA
  findAll(params: {
    take: number;
    skip: number;
    username: string;
  }): Promise<[UserItemsCount[], number]> {
    const { skip, take, username } = params;
    // Para agregar select en entidad principal (no virtual) utilizar .execute()
    return this._userItemCountRepo.findAndCount(
      {
        $and: [
          { type: { $ne: 'master' } },
          { username: { $ilike: `${username}%` } },
        ],
      },
      {
        offset: skip * take || 0,
        limit: take,
        orderBy: { id: QueryOrder.ASC },
      },
    );
  }
}
