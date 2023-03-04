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
import { CreateItem, UpdateItem } from '@dto/item';
import { RoleGuard } from '../guards/role.guard';
import { GetTokenInterceptor } from '../interceptors/get-token.interceptor';

@Controller('item')
export class ItemController {
  constructor(
    private _itemRepo: ItemRepoService,
    private _tagRepo: TagRepoService,
  ) {}

  @Get()
  @SetMetadata('roles', ['basic', 'admin'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  findAll(
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Query('order') order: string,
    @Query('orderBy') orderBy: string,
    @Query(
      'search',
      new ParseArrayPipe({ items: String, optional: true, separator: ',' }),
    )
    search: string,
    @Res() res: FastifyReply,
  ) {
    this._itemRepo
      .findAll({
        rol: 'admin',
        take: +take || 10,
        skip: +skip || 0,
        search: [],
        order: ['ASC', 'DESC'].includes(orderBy)
          ? (orderBy as 'ASC' | 'DESC')
          : 'ASC',
        orderBy: ['createdAt', 'name', 'updatedAt', 'price', 'stock'].includes(
          orderBy,
        )
          ? `item.${orderBy}`
          : 'item.createdAt',
        userID: 1,
      })
      .then(([items, cound]) =>
        res.status(HttpStatus.OK).send({ items, cound }),
      );
  }

  @Get(':itemID')
  @SetMetadata('roles', ['basic', 'admin'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  findOne(
    @Headers('user_id') userID: string,
    @Param('itemID', ParseIntPipe) itemID: number,
    @Res() res: FastifyReply,
  ) {
    this._itemRepo
      .findOne({ itemID, rol: 'admin', userID: +userID })
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

  @Post('update/:itemID')
  @SetMetadata('roles', ['basic', 'admin'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  update(
    @Param('itemID', ParseIntPipe) itemID: number,
    @Body() cuerpo: UpdateItem,
    @Res() res: FastifyReply,
  ) {}

  @Post('update/:itemID/tags')
  @SetMetadata('roles', ['basic', 'admin'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  updateTags(
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
}
