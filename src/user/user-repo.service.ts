import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { UserModel } from './user-model';
import { UserTypes } from './user.enum';

@Injectable()
export class UserRepoService {
  private readonly _logger = new Logger(UserRepoService.name);
  constructor(
    @InjectRepository(UserModel)
    private readonly _userRepo: EntityRepository<UserModel>,
  ) {}

  async create(params: { email: string; username: string; password: string }) {
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
}
