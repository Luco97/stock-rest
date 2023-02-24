import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { ItemModel } from '../item/item-model';
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
      .where({
        $and: [
          { 'item.id': itemID },
          { $or: [{ 'user.type': rol }, { 'user.id': userID }] },
        ],
      })
      .orderBy({ createdAt: orderBy })
      .limit(take, take * skip)
      .getResultAndCount();
  }

  create(item: ItemModel, params: { change: string; previousValue: string }) {
    const { change, previousValue } = params;

    this._historyRepo
      .createQueryBuilder()
      .insert({ item, change, previousValue })
      .execute('get');
  }
}
