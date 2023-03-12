import { Injectable } from '@nestjs/common';
import { QueryResult } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { HistoricModel } from './historic-model';

@Injectable()
export class HistoricRepoService {
  constructor(
    @InjectRepository(HistoricModel)
    private readonly _historyRepo: EntityRepository<HistoricModel>,
  ) {}

  findItemChanges(params: {
    itemID: number;
    userID: number;
    rol: string;
    skip: number;
    take: number;
    orderBy: 'ASC' | 'DESC';
  }): Promise<[HistoricModel[], number]> {
    const { itemID, rol, userID, orderBy, skip, take } = params;

    return this._historyRepo
      .createQueryBuilder('change')
      .leftJoin('change.item', 'item')
      .leftJoin('item.user', 'user')
      .where({
        $and: [
          { 'item.id': itemID },
          { $or: [{ "lower('admin')": rol }, { 'user.id': userID }] },
        ],
      })
      .orderBy({ createdAt: orderBy })
      .limit(take, take * skip)
      .getResultAndCount();
  }

  create(
    itemID: number,
    params: { change: string; previousValue: string },
  ): Promise<QueryResult<HistoricModel>> {
    const { change, previousValue } = params;

    return this._historyRepo
      .createQueryBuilder()
      .insert({ item: { id: itemID }, change, previousValue })
      .execute('run');
  }
}
