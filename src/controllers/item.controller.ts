import {
  Res,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Headers,
  Controller,
  ParseIntPipe,
  ParseArrayPipe,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { TagRepoService } from '@models/tag';
import { ItemRepoService } from '@models/item';
import { HistoricRepoService } from '@models/historic';
import { CreateItem, UpdateItem, UpdateTags } from '@dto/item';
import { RoleGuard } from '../guards/role.guard';
import { GetTokenInterceptor } from '../interceptors/get-token.interceptor';

@Controller('item')
export class ItemController {
  constructor(
    private _tagRepo: TagRepoService,
    private _itemRepo: ItemRepoService,
    private _historicRepo: HistoricRepoService,
  ) {}

  @Get()
  @SetMetadata('roles', ['basic', 'admin'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  findAll(
    @Headers('user_id') userID: string,
    @Headers('user_type') userType: string,
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Query('order') order: string,
    @Query('orderBy') orderBy: string,
    @Query(
      'search',
      new ParseArrayPipe({ items: String, optional: true, separator: ',' }),
    )
    search: string[],
    @Res() res: FastifyReply,
  ) {
    this._itemRepo
      .findAll({
        take: +take || 10,
        skip: +skip || 0,
        search: search || [],
        order: ['ASC', 'DESC'].includes(orderBy)
          ? (orderBy as 'ASC' | 'DESC')
          : 'ASC',
        orderBy: ['createdAt', 'name', 'updatedAt', 'price', 'stock'].includes(
          orderBy,
        )
          ? `item.${orderBy}`
          : 'item.createdAt',
        rol: userType,
        userID: +userID,
      })
      .then(([items, count]) =>
        res.status(HttpStatus.OK).send({ items, count }),
      );
  }

  @Get(':itemID')
  @SetMetadata('roles', ['basic', 'admin'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  findOne(
    @Headers('user_id') userID: string,
    @Headers('user_type') userType: string,
    @Param('itemID', ParseIntPipe) itemID: number,
    @Res() res: FastifyReply,
  ) {
    this._itemRepo
      .findOne({ itemID, rol: userType, userID: +userID })
      .then((item) => {
        res.send({
          item,
        });
      });
  }

  @Post('create')
  @SetMetadata('roles', ['basic', 'admin'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  create(
    @Headers('user_id') userID: string,
    @Body() createBody: CreateItem,
    @Res() res: FastifyReply,
  ) {
    const { name, imageUrl, price, stock } = createBody;
    this._itemRepo
      .create({ imageUrl, name, price, stock, userID: +userID })
      .then((result) => {
        res.status(HttpStatus.OK).send({
          status: HttpStatus.OK,
          message: 'item created',
          item: {
            id: result.insertId,
            name,
            price,
            stock,
            imageUrl,
          },
        });
      });
  }

  @Post(':itemID/update')
  @SetMetadata('roles', ['basic', 'admin'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  update(
    @Param('itemID', ParseIntPipe) itemID: number,
    @Body() cuerpo: UpdateItem,
    @Res() res: FastifyReply,
  ) {}

  @Delete(':itemID/delete')
  @SetMetadata('roles', ['admin'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  delete(
    @Param('itemID', ParseIntPipe) itemID: number,
    @Res() res: FastifyReply,
  ) {}

  @Get(':itemID/changes')
  @SetMetadata('roles', ['basic', 'admin'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  changes(
    @Headers('user_id') userID: string,
    @Headers('user_type') userType: string,
    @Param('itemID', ParseIntPipe) itemID: number,
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Query('orderBy') orderBy: string,
    @Res()
    res: FastifyReply,
  ) {
    this._historicRepo
      .findItemChanges({
        itemID,
        orderBy: ['ASC', 'DESC'].includes(orderBy)
          ? (orderBy as 'ASC' | 'DESC')
          : 'ASC',
        take: +take || 5,
        skip: +skip || 0,
        userID: +userID,
        rol: userType,
      })
      .then(([changes, count]) =>
        res.status(HttpStatus.OK).send({
          status: HttpStatus.OK,
          message: `All changes from item with id = ${itemID}`,
          changes,
          count,
        }),
      );
  }

  @Post(':itemID/update/tags')
  @SetMetadata('roles', ['basic', 'admin'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  updateTags(
    @Headers('user_id') userID: string,
    @Headers('user_type') userType: string,
    @Param('itemID', ParseIntPipe) itemID: number,
    @Body() cuerpo: UpdateTags,
    @Res() res: FastifyReply,
  ) {
    const { tagIDs } = cuerpo;

    Promise.all([
      this._itemRepo.findOne({ itemID, rol: userType, userID: +userID }),
      this._tagRepo.findAllByID(tagIDs),
    ]).then(([item, tags]) => {
      this._itemRepo.updateTags({ item, tags }).then(() =>
        res.status(HttpStatus.OK).send({
          status: HttpStatus.OK,
          message: `tags updated for item with id = ${itemID}`,
          item: {
            ...item,
            tags,
          },
        }),
      );
    });
  }
}
