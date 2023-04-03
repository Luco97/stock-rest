import { HttpStatus, Injectable } from '@nestjs/common';
import { QueryResult, RequiredEntityData } from '@mikro-orm/core';
import { unlink } from 'fs';

import { TagRepoService } from '@models/tag';
import { CloudinaryService } from '@shared/cloudinary';
import { ItemModel, ItemRepoService } from '@models/item';
import { HistoricModel, HistoricRepoService } from '@models/historic';

@Injectable()
export class ItemService {
  constructor(
    private _tagRepo: TagRepoService,
    private _itemRepo: ItemRepoService,
    private _historicRepo: HistoricRepoService,
    private _cloudinaryService: CloudinaryService,
  ) {}

  findAll(params: {
    take: number;
    skip: number;
    order: string;
    orderBy: string;
    userID: number;
    userType: string;
    search?: string[];
    tagsID?: number[];
  }): Promise<[ItemModel[], number]> {
    const { order, orderBy, skip, take, userID, userType, search, tagsID } =
      params;

    return this._itemRepo.findAll({
      take: take || 10,
      skip: skip || 0,
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
      search: search || [],
      tagsID: tagsID || [],
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
    file: Express.Multer.File;
    name: string;
    price: number;
    stock: number;
    userID: number;
  }): Promise<{
    status: number;
    message: string;
    item: RequiredEntityData<ItemModel>;
  }> {
    const { file, name, price, stock, userID } = params;

    return new Promise<{
      status: number;
      message: string;
      item: RequiredEntityData<ItemModel>;
    }>((resolve, reject) => {
      if (!file) {
        const defaultImage: string =
          'https://res.cloudinary.com/dogjjjeg2/image/upload/v1680563659/default_image/default-image.png';
        this._itemRepo
          .create({
            imageUrl: defaultImage,
            name,
            price,
            stock,
            userID,
          })
          .then((result) =>
            resolve({
              status: HttpStatus.OK,
              message: 'item created',
              item: {
                name,
                imageUrl: defaultImage,
                price,
                stock,
                id: result.insertId,
              },
            }),
          );
      } else
        this._cloudinaryService
          .upload(
            file.path,
            `product_${name.toLowerCase().replace(' ', '-')}`,
            file.filename,
          )
          .then((cloudinaryResponse) => {
            unlink(
              file.path,
              (error) =>
                new Error(
                  `Somethin went wrong with unlink file ${file.filename}`,
                ),
            );
            this._itemRepo
              .create({
                imageUrl: cloudinaryResponse.url,
                name,
                price,
                stock,
                userID,
              })
              .then((result) =>
                resolve({
                  status: HttpStatus.OK,
                  message: 'item created',
                  item: {
                    name,
                    imageUrl: cloudinaryResponse.url,
                    price,
                    stock,
                    id: result.insertId,
                  },
                }),
              );
          });
    });
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
            else {
              const allChanges = this.allChanges({
                imageUrl,
                name,
                price,
                stock,
                item,
              });

              // this._itemRepo
              //   .updateItem({ imageUrl, item, name, price, stock })
              //   .then((updateItem) =>
              //     resolve({
              //       status: HttpStatus.OK,
              //       message: `item with id = ${itemID} updated`,
              //       item: updateItem,
              //     }),
              //   );

              Promise.all([
                this._itemRepo.updateItem({
                  imageUrl,
                  item,
                  name,
                  price,
                  stock,
                }),
                ...allChanges,
              ]).then(([updateItem]) =>
                resolve({
                  status: HttpStatus.OK,
                  message: `item with id = ${itemID} updated`,
                  item: updateItem,
                }),
              );
            }
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
              message: `no item with id = ${itemID}`,
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

  relatedItems(params: {
    itemID: number;
    take: number;
    order: string;
    skip: number;
    userID: number;
    userType: string;
  }): Promise<{
    status: number;
    message: string;
    items?: ItemModel[];
    count?: number;
  }> {
    const { itemID, userID, skip, take, order, userType } = params;

    return new Promise<{
      status: number;
      message: string;
      items?: ItemModel[];
      count?: number;
    }>((resolve, reject) => {
      this.findOne({ itemID, rol: userType, userID }).then((item) => {
        if (!item.tags.length)
          resolve({
            status: HttpStatus.OK,
            message: `item doesn't exist`,
            count: 0,
          });
        else {
          const tagsID: number[] = item.tags
            .getItems()
            .map<number>((element) => element.id);

          this._itemRepo
            .relatedItems({
              take: take || 10,
              skip: skip || 0,
              order: ['ASC', 'DESC'].includes(order)
                ? (order as 'ASC' | 'DESC')
                : 'ASC',
              orderBy: 'item.createdAt',
              tagsID,
              userID,
            })
            .then(([items, count]) =>
              resolve({
                status: HttpStatus.OK,
                message: `items related to "${item.name}"`,
                items,
                count,
              }),
            );
        }
      });
    });
  }

  private allChanges(params: {
    imageUrl: string;
    name: string;
    price: number;
    stock: number;
    item: ItemModel;
  }): Promise<QueryResult<HistoricModel>>[] {
    const { imageUrl, name, price, stock, item } = params;
    const allChanges: Promise<QueryResult<HistoricModel>>[] = [];
    if (imageUrl)
      allChanges.push(
        this._historicRepo.create(item.id, {
          change: 'image',
          previousValue: item.imageUrl,
        }),
      );
    if (name)
      allChanges.push(
        this._historicRepo.create(item.id, {
          change: 'name',
          previousValue: item.name,
        }),
      );
    if (price)
      allChanges.push(
        this._historicRepo.create(item.id, {
          change: 'price',
          previousValue: item.price.toString(),
        }),
      );
    if (stock)
      allChanges.push(
        this._historicRepo.create(item.id, {
          change: 'stock',
          previousValue: item.stock.toString(),
        }),
      );

    return allChanges;
  }
}
