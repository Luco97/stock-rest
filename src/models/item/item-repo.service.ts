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
    userID: number;
    imageUrl: string;
    description: string;
    colorTheme: string;
  }) {
    const { imageUrl, name, price, description, stock, userID, colorTheme } =
      params;
    const newItem = this._itemRepo.create({
      imageUrl,
      name: name.replace(/[^A-Za-z0-9|ñ]+/g, '-'),
      price,
      stock,
      colorTheme,
      description,
      user: { id: userID },
    });

    return this._itemRepo.createQueryBuilder().insert(newItem).execute('run');
  }

  findAll(params: {
    skip: number;
    take: number;
    orderBy: string;
    order: 'ASC' | 'DESC';
    search?: string[];
    priceMax?: number;
    priceMin?: number;
    inTagsID?: number[];
    usersID?: number[];
  }): Promise<[ItemModel[], number]> {
    const {
      order,
      orderBy,
      skip,
      take,
      search,
      priceMax,
      priceMin,
      inTagsID,
      usersID,
    } = params;

    let logicOr = [];

    const itemName: { [key: string]: { $ilike: string } }[] =
      search?.map<{
        [key: string]: { $ilike: string };
      }>((element) => ({
        ['lower("item"."name")']: { $ilike: `%${element}%` },
      })) || [];

    logicOr.push(...itemName);
    let logicAnd = [];
    if (inTagsID?.length)
      logicAnd.push({
        'tags.id': { $in: inTagsID },
      });
    if (usersID?.length)
      logicAnd.push({
        'user.id': { $in: usersID },
      });

    return (
      this._itemRepo
        .createQueryBuilder('item')
        .select([
          'item.id',
          'item.name',
          'item.price',
          'item.stock',
          'item.imageUrl',
          'item.createdAt',
          'item.updatedAt',
          'item.colorTheme',
        ])
        .leftJoinAndSelect('item.user', 'user')
        .leftJoinAndSelect('item.tags', 'tags')
        .where({
          $and: [
            ...logicAnd,
            ...itemName,
            {
              price: {
                $lte: priceMax || 9999,
                $gte: priceMin || 0,
              },
            },
          ],
        })
        // .having(`COUNT(distinc "tags"."id") = ${inTagsID.length}`) <--- Error :( para encontrar con esos tags y mas
        .limit(take, take * skip)
        .orderBy({ [orderBy]: order })
        .getResultAndCount()
    );
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
          {
            $or: [
              { 'user.id': userID },
              {
                $and: [
                  {
                    "lower('admin')": rol,
                  },
                  { 'user.type': { $nin: ['master', 'mod', 'admin'] } },
                ],
              },
              {
                $and: [
                  {
                    "lower('mod')": rol,
                  },
                  { 'user.type': { $nin: ['master', 'mod'] } },
                ],
              },
              { "lower('master')": rol },
            ],
          },
        ],
      })
      .getSingleResult();
  }

  findOneByName(name: string): Promise<number> {
    return this._itemRepo
      .createQueryBuilder('item')
      .where({
        'lower("item"."name")': name
          .toLowerCase()
          .replace(/[^A-Za-z0-9|ñ]+/g, '-'),
      })
      .getCount();
  }

  updateItem(params: {
    item: ItemModel;
    description: string;
    stock: number;
    price: number;
    imageUrl: string;
    colorTheme: string;
  }): Promise<ItemModel> {
    const { imageUrl, description, price, stock, item, colorTheme } = params;

    if (price) item['price'] = price;
    if (stock) item['stock'] = stock;
    if (description) item['description'] = description;
    if (imageUrl) item['imageUrl'] = imageUrl;
    if (colorTheme) item['colorTheme'] = colorTheme;

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
            {
              $or: [
                { 'user.id': userID }, // quien crea item
                {
                  $and: [
                    {
                      "lower('admin')": rol, // admin borrando otros items
                    },
                    { 'user.type': { $nin: ['master', 'mod', 'admin'] } }, // admin puede borrar propios o basicos
                  ],
                },
                {
                  $and: [
                    {
                      "lower('mod')": rol,
                    },
                    { 'user.type': { $nin: ['master', 'mod'] } },
                  ],
                },
                { "lower('master')": rol },
              ],
            },
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

  relatedItems(params: {
    tagsID: number[];
    skip: number;
    take: number;
    orderBy: string;
    order: 'ASC' | 'DESC';
    userID: number;
  }) {
    const { order, orderBy, skip, tagsID, take, userID } = params;
    return this._itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.user', 'user')
      .leftJoinAndSelect('item.tags', 'tags')
      .where({
        $and: [{ 'tags.id': { $in: tagsID } }, { 'user.id': { $not: userID } }],
      })
      .limit(take, take * skip)
      .orderBy({ [orderBy]: order })
      .getResultAndCount();
  }
}
