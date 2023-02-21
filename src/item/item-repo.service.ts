import { Injectable } from '@nestjs/common';
import { EntityData } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { ItemModel } from './item-model';
import { UserModel } from '../user/user-model';

@Injectable()
export class ItemRepoService {
  constructor(
    @InjectRepository(ItemModel)
    private readonly _itemRepo: EntityRepository<ItemModel>,
  ) {}

  create(params: {
    name: string;
    stock: number;
    price: number;
    imageUrl: string;
    user: UserModel;
  }) {
    const { imageUrl, name, price, stock, user } = params;

    return this._itemRepo.persistAndFlush(
      this._itemRepo.create({
        imageUrl,
        name,
        price,
        stock,
        user,
      }),
    );
  }

  findAll(params: {
    skip: number;
    take: number;
    orderBy: string;
    order: 'ASC' | 'DESC';
    rol: string;
    userID: number;
  }) {
    const { order, orderBy, skip, take, rol, userID } = params;

    return this._itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.user', 'user')
      .leftJoinAndSelect('item.tags', 'tags')
      .where({ $or: [{ 'user.type': rol }, { 'user.id': userID }] })
      .limit(take, take * skip)
      .orderBy({ [orderBy]: order })
      .getResultAndCount();
  }

  findOne(params: {
    rol: string;
    userID: number;
    itemID: number;
  }): Promise<ItemModel> {
    const { itemID, rol, userID } = params;
    return this._itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.user', 'user')
      .leftJoinAndSelect('item.tags', 'tags')
      .where({
        $and: [
          { 'item.id': itemID },
          { $or: [{ 'user.type': rol }, { 'user.id': userID }] },
        ],
      })
      .getSingleResult();
  }

  updateItem(params: {
    userID: number;
    itemID: number;
    name: string;
    stock: number;
    price: number;
    imageUrl: string;
    rol: string;
  }) {
    const { itemID, userID, imageUrl, name, price, stock, rol } = params;
    const updateItem: EntityData<ItemModel> = {};

    if (name) updateItem['name'] = name;
    if (imageUrl) updateItem['imageUrl'] = imageUrl;
    if (price) updateItem['price'] = price;
    if (stock) updateItem['stock'] = stock;

    return this._itemRepo
      .createQueryBuilder('item')
      .leftJoin('item.user', 'user')
      .update(updateItem)
      .where({
        $and: [
          { 'item.id': itemID },
          { $or: [{ 'user.type': rol }, { 'user.id': userID }] },
        ],
      })
      .execute('get');
  }
}
