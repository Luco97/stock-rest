import { RequiredEntityData } from '@mikro-orm/core';
import { HttpStatus, Injectable } from '@nestjs/common';

import { TagRepoService } from '@models/tag';
import { HistoricModel, HistoricRepoService } from '@models/historic';
import { ItemModel, ItemRepoService } from '@models/item';

@Injectable()
export class ItemService {
  constructor(
    private _tagRepo: TagRepoService,
    private _itemRepo: ItemRepoService,
    private _historicRepo: HistoricRepoService,
  ) {}

  findAll(params: {
    take: number;
    skip: number;
    order: string;
    orderBy: string;
    userID: number;
    userType: string;
    search: string[];
  }): Promise<[ItemModel[], number]> {
    const { order, orderBy, skip, take, userID, userType, search } = params;

    return this._itemRepo.findAll({
      take: take || 10,
      skip: skip || 0,
      search: search || [],
      order: ['ASC', 'DESC'].includes(order)
        ? (order as 'ASC' | 'DESC')
        : 'ASC',
      orderBy: ['createdAt', 'name', 'updatedAt', 'price', 'stock'].includes(
        orderBy,
      )
        ? `item.${orderBy}`
        : 'item.createdAt',
      rol: userType,
      userID: userID,
    });
  }

  findOne(params: {
    itemID: number;
    rol: string;
    userID: number;
  }): Promise<ItemModel> {
    const { itemID, rol, userID } = params;

    return this._itemRepo.findOne({ itemID, rol, userID });
  }

  create(params: {
    imageUrl: string;
    name: string;
    price: number;
    stock: number;
    userID: number;
  }): Promise<{
    status: number;
    message: string;
    item: RequiredEntityData<ItemModel>;
  }> {
    const { imageUrl, name, price, stock, userID } = params;

    return new Promise<{
      status: number;
      message: string;
      item: RequiredEntityData<ItemModel>;
    }>((resolve, reject) =>
      this._itemRepo
        .create({ imageUrl, name, price, stock, userID })
        .then((result) =>
          resolve({
            status: HttpStatus.OK,
            message: 'item created',
            item: { name, imageUrl, price, stock, id: result.insertId },
          }),
        ),
    );
  }

  update(params: {
    imageUrl: string;
    name: string;
    price: number;
    stock: number;
    userID: number;
    userType: string;
    itemID: number;
  }): Promise<{ status: number; message: string; item?: ItemModel }> {
    const { imageUrl, name, price, stock, itemID, userID, userType } = params;

    return new Promise<{ status: number; message: string; item?: ItemModel }>(
      (resolve, reject) =>
        this._itemRepo
          .findOne({ rol: userType, itemID, userID })
          .then((item) => {
            if (!item)
              resolve({
                status: HttpStatus.OK,
                message: `no item with id = ${itemID} found`,
              });
            else
              this._itemRepo
                .updateItem({ imageUrl, item, name, price, stock })
                .then((updateItem) =>
                  resolve({
                    status: HttpStatus.OK,
                    message: `item with id = ${itemID} updated`,
                    item: updateItem,
                  }),
                );
          }),
    );
  }

  delete(params: {
    itemID: number;
    userType: string;
    userID: number;
  }): Promise<string> {
    const { itemID, userID, userType } = params;

    return this._itemRepo.delete({ itemID, rol: userType, userID });
  }

  itemHistoric(params: {
    take: number;
    skip: number;
    order: string;
    itemID: number;
    userID: number;
    userType: string;
  }): Promise<[HistoricModel[], number]> {
    const { order, skip, take, userID, userType, itemID } = params;

    return this._historicRepo.findItemChanges({
      itemID,
      orderBy: ['ASC', 'DESC'].includes(order)
        ? (order as 'ASC' | 'DESC')
        : 'ASC',
      take: take || 5,
      skip: skip || 0,
      userID,
      rol: userType,
    });
  }

  updateItemTags(params: {
    itemID: number;
    userID: number;
    userType: string;
    tagIDs: number[];
  }) {
    const { tagIDs, itemID, userID, userType } = params;

    return new Promise<{ status: number; message: string; item?: ItemModel }>(
      (resolve, reject) =>
        Promise.all([
          this._itemRepo.findOne({ itemID, rol: userType, userID }),
          this._tagRepo.findAllByID(tagIDs),
        ]).then(([item, tags]) => {
          if (!item)
            resolve({
              status: HttpStatus.OK,
              message: `tags updated for item with id = ${itemID}`,
            });
          else
            this._itemRepo.updateTags({ item, tags }).then(() => {
              resolve({
                status: HttpStatus.OK,
                message: `tags ${
                  tags.length ? 'updated' : 'removed'
                } for item with id = ${itemID}`,
                item,
              });
            });
        }),
    );
  }
}
