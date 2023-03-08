import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { ItemModel } from './item-model';
import { TagModel } from '../tag/tag-model';

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
    userID: number;
  }) {
    const { imageUrl, name, price, stock, userID } = params;
    const newItem = this._itemRepo.create({
      imageUrl: imageUrl || 'default.png',
      name,
      price,
      stock,
      user: { id: userID },
    });

    return this._itemRepo.createQueryBuilder().insert(newItem).execute('run');
  }

  init() {
    return this._itemRepo.flush();
  }

  findAll(params: {
    skip: number;
    take: number;
    orderBy: string;
    order: 'ASC' | 'DESC';
    rol: string;
    userID: number;
    search?: string[];
  }): Promise<[ItemModel[], number]> {
    const { order, orderBy, skip, take, rol, userID, search } = params;

    const itemName: { [key: string]: { $ilike: string } }[] = search.map<{
      [key: string]: { $ilike: string };
    }>((element) => ({ ['lower("item"."name")']: { $ilike: `%${element}%` } }));

    const tagName: { [key: string]: { $ilike: string } }[] = search.map<{
      [key: string]: { $ilike: string };
    }>((element) => ({ ['lower("tag"."name")']: { $ilike: `%${element}%` } }));

    return this._itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.user', 'user')
      .leftJoinAndSelect('item.tags', 'tags')
      .where({
        $and: [
          {
            $or: [
              { 'user.id': userID },
              { "lower('admin')": rol },
              // ...tagName,
            ],
          },
          ...itemName,
        ],
      })
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
          { $or: [{ "lower('admin')": rol }, { 'user.id': userID }] },
        ],
      })
      .getSingleResult();
  }

  updateItem(params: {
    item: ItemModel;
    name: string;
    stock: number;
    price: number;
    imageUrl: string;
  }): Promise<ItemModel> {
    const { imageUrl, name, price, stock, item } = params;

    if (name) item['name'] = name;
    if (price) item['price'] = price;
    if (stock) item['stock'] = stock;
    if (imageUrl) item['imageUrl'] = imageUrl;

    return new Promise<ItemModel>((resolve, reject) =>
      this._itemRepo.persistAndFlush(item).then(() => {
        resolve(item);
      }),
    );
  }

  updateTags(params: {
    item: ItemModel;
    tags: TagModel[];
  }): Promise<ItemModel> {
    const { item, tags } = params;

    item.tags.removeAll();
    item.tags.add(tags);

    return new Promise<ItemModel>((resolve, reject) =>
      this._itemRepo.flush().then(() => resolve(item)),
    );
  }

  delete(params: { rol: string; userID: number; itemID: number }) {
    const { itemID, rol, userID } = params;
    return new Promise<string>((resolve, reject) =>
      this._itemRepo
        .createQueryBuilder('item')
        .leftJoin('item.user', 'user')
        .leftJoinAndSelect('item.changes', 'changes')
        .where({
          $and: [
            { 'item.id': itemID },
            { $or: [{ "lower('admin')": rol }, { 'user.id': userID }] },
          ],
        })
        .getSingleResult()
        .then((item) => {
          if (!item) resolve('no item found');
          else
            this._itemRepo.removeAndFlush(item).then(() => {
              resolve(`item with id = ${item.id} removed`);
            });
        }),
    );
  }
}
