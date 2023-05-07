import { ConfigService } from '@nestjs/config';
import { HttpStatus, Injectable } from '@nestjs/common';
import { QueryResult, RequiredEntityData } from '@mikro-orm/core';
import { unlink } from 'fs';
import { UploadApiResponse } from 'cloudinary';

import { TagRepoService } from '@models/tag';
import { CloudinaryService } from '@shared/cloudinary';
import { ItemModel, ItemRepoService } from '@models/item';
import { HistoricModel, HistoricRepoService } from '@models/historic';

@Injectable()
export class ItemService {
  constructor(
    private _tagRepo: TagRepoService,
    private _itemRepo: ItemRepoService,
    private _configService: ConfigService,
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
    inTagsID?: number[];
    ninTagsID?: number[];
  }): Promise<[ItemModel[], number]> {
    const {
      order,
      orderBy,
      skip,
      take,
      userID,
      userType,
      search,
      inTagsID,
      ninTagsID,
    } = params;

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
      inTagsID: inTagsID || [],
      ninTagsID: ninTagsID || [],
    });
  }

  findOne(params: {
    itemID: number;
    rol: string;
    userID: number;
    itemName?: string;
  }): Promise<ItemModel> {
    const { itemID, rol, userID, itemName } = params;

    return this._itemRepo.findOne({ itemID, rol, userID });
  }

  findOneByName(itemName: string): Promise<number> {
    return this._itemRepo.findOneByName(itemName);
  }

  create(params: {
    file: Express.Multer.File;
    name: string;
    price: number;
    stock: number;
    userID: number;
    description: string;
  }): Promise<{
    statusCode: number;
    message: string;
    item: RequiredEntityData<ItemModel>;
  }> {
    const { file, name, price, description, stock, userID } = params;

    return new Promise<{
      statusCode: number;
      message: string;
      item: RequiredEntityData<ItemModel>;
    }>((resolve, reject) => {
      if (!file) {
        const defaultImage: string =
          this._configService.get<string>('ITEM_DEFAULT_IMAGE');
        this._itemRepo
          .create({
            imageUrl: defaultImage,
            name,
            price,
            stock,
            userID,
            description,
          })
          .then((result) =>
            resolve({
              statusCode: HttpStatus.OK,
              message: 'item created',
              item: {
                id: result.insertId,
                name,
                imageUrl: defaultImage,
                price,
                stock,
                description,
              },
            }),
          );
      } else {
        this._cloudinaryService
          .upload(
            file.path,
            `product_${name.toLowerCase().replace(/[^A-Za-z0-9|ñ]+/g, '-')}`,
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
                description,
                userID,
              })
              .then((result) =>
                resolve({
                  statusCode: HttpStatus.OK,
                  message: 'item created',
                  item: {
                    id: result.insertId,
                    name,
                    price,
                    stock,
                    imageUrl: cloudinaryResponse.url,
                  },
                }),
              );
          });
      }
    });
  }

  update(params: {
    imageUrl: string;
    price: number;
    stock: number;
    userID: number;
    userType: string;
    itemID: number;
    description: string;
  }): Promise<{ statusCode: number; message: string; item?: ItemModel }> {
    const { description, imageUrl, price, stock, itemID, userID, userType } =
      params;

    return new Promise<{
      statusCode: number;
      message: string;
      item?: ItemModel;
    }>((resolve, reject) =>
      this._itemRepo.findOne({ rol: userType, itemID, userID }).then((item) => {
        if (!item)
          resolve({
            statusCode: HttpStatus.OK,
            message: `no item with id = ${itemID} found`,
          });
        else {
          const allChanges = this.allChanges({
            imageUrl,
            description,
            price,
            stock,
            item,
          });

          Promise.all([
            this._itemRepo.updateItem({
              imageUrl,
              item,
              description,
              price,
              stock,
            }),
            ...allChanges,
          ]).then(([updateItem]) =>
            resolve({
              statusCode: HttpStatus.OK,
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

    return new Promise<{
      statusCode: number;
      message: string;
      item?: ItemModel;
    }>((resolve, reject) =>
      Promise.all([
        this._itemRepo.findOne({ itemID, rol: userType, userID }),
        this._tagRepo.findAllByID(tagIDs),
      ]).then(([item, tags]) => {
        if (!item)
          resolve({
            statusCode: HttpStatus.OK,
            message: `no item with id = ${itemID}`,
          });
        else {
          const beforeTags: string[] = item.tags
            .getItems()
            .map<string>((tag) => tag.name);
          Promise.all([
            this._itemRepo.updateTags({ item, tags }),
            this._historicRepo.create(itemID, {
              change: 'tags',
              previousValue: beforeTags.length ? beforeTags.join() : 'no tags',
            }),
          ]).then(() => {
            resolve({
              statusCode: HttpStatus.OK,
              message: `tags ${
                tags.length ? 'updated' : 'removed'
              } for item with id = ${itemID}`,
              item,
            });
          });
        }
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
    statusCode: number;
    message: string;
    items?: ItemModel[];
    count?: number;
  }> {
    const { itemID, userID, skip, take, order, userType } = params;

    return new Promise<{
      statusCode: number;
      message: string;
      items?: ItemModel[];
      count?: number;
    }>((resolve, reject) => {
      this.findOne({ itemID, rol: userType, userID }).then((item) => {
        if (!item.tags.length)
          resolve({
            statusCode: HttpStatus.OK,
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
                statusCode: HttpStatus.OK,
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
    description: string;
    price: number;
    stock: number;
    item: ItemModel;
  }): Promise<QueryResult<HistoricModel>>[] {
    const { imageUrl, description, price, stock, item } = params;
    const allChanges: Promise<QueryResult<HistoricModel>>[] = [];
    if (imageUrl)
      allChanges.push(
        this._historicRepo.create(item.id, {
          change: 'front image',
          previousValue: item.imageUrl,
        }),
      );
    if (description)
      allChanges.push(
        this._historicRepo.create(item.id, {
          change: 'description',
          previousValue: item.description ?? 'no description',
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
