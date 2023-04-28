import {
  Res,
  Get,
  Put,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Headers,
  UseGuards,
  Controller,
  SetMetadata,
  ParseIntPipe,
  ValidationPipe,
  ParseArrayPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { FastifyReply } from 'fastify';

import {
  GetTokenInterceptor,
  CreateItemInterceptor,
  MultipleFilesInterceptor,
} from '@shared/interceptors';
import { CreateItem, UpdateItem, UpdateTags } from '@dto/item';

import { RoleGuard } from '../guards/role.guard';
import { ItemService } from '../services/item.service';

@Controller('item')
export class ItemController {
  constructor(private _itemService: ItemService) {}

  @Get()
  @SetMetadata('roles', ['basic', 'admin', 'master', 'mod'])
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
    @Query(
      'tagsID',
      new ParseArrayPipe({ items: Number, optional: true, separator: ',' }),
    )
    tagsID: number[],
    @Query(
      'excludeTagsID',
      new ParseArrayPipe({ items: Number, optional: true, separator: ',' }),
    )
    excludeTagsID: number[],
    @Res() res: FastifyReply,
  ) {
    this._itemService
      .findAll({
        order,
        search:
          search?.map<string>((word) =>
            word.replace(/[^A-Za-z0-9|ñ]+/g, '-'),
          ) || [],
        skip: +skip,
        take: +take,
        orderBy,
        userID: +userID,
        userType,
        inTagsID: tagsID,
        ninTagsID: excludeTagsID,
      })
      .then(([items, count]) =>
        res.status(HttpStatus.OK).send({
          items,
          count,
          statusCode: HttpStatus.OK,
          message: 'All items',
        }),
      );
  }

  @Get(':itemID')
  @SetMetadata('roles', ['basic', 'admin', 'master', 'mod'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  findOne(
    @Headers('user_id') userID: string,
    @Headers('user_type') userType: string,
    @Param('itemID', ParseIntPipe) itemID: number,
    @Res() res: FastifyReply,
  ) {
    this._itemService
      .findOne({ itemID, rol: userType, userID: +userID })
      .then((item) => {
        res.send({
          item,
          statusCode: HttpStatus.OK,
          message: 'All items',
        });
      });
  }

  @Post('create')
  @SetMetadata('roles', ['basic', 'admin'])
  @UseGuards(RoleGuard)
  @UseInterceptors(
    GetTokenInterceptor,
    MultipleFilesInterceptor('displayImages', 5, {
      storage: diskStorage({
        destination: './upload/multiple',
        filename(req, file, callback) {
          callback(
            null,
            `${randomUUID()}-${
              req.body?.name + extname(file.originalname) ||
              randomUUID() + extname(file.originalname)
            }`,
          );
        },
      }),
      fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
          return callback(Error('only images'));
        return callback(null, true);
      },
    }),
    CreateItemInterceptor,
  )
  async create(
    @Headers('user_id') userID: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body(new ValidationPipe())
    createBody: CreateItem,
    @Res() res: FastifyReply,
  ) {
    const { name, price, stock } = createBody;

    this._itemService
      .create({
        files,
        name,
        price,
        stock,
        userID: +userID,
      })
      .then((response) => res.status(response.statusCode).send(response));
  }

  @Put(':itemID/update')
  @SetMetadata('roles', ['basic', 'admin', 'mod'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  update(
    @Headers('user_id') userID: string,
    @Headers('user_type') userType: string,
    @Param('itemID', ParseIntPipe) itemID: number,
    @Body() cuerpo: UpdateItem,
    @Res() res: FastifyReply,
  ) {
    const { imageUrl, name, price, stock } = cuerpo;
    this._itemService
      .update({
        imageUrl,
        itemID,
        name,
        price,
        stock,
        userID: +userID,
        userType,
      })
      .then((response) => res.status(response.statusCode).send(response));
  }

  @Delete(':itemID/delete')
  @SetMetadata('roles', ['admin', 'mod'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  delete(
    @Headers('user_id') userID: string,
    @Headers('user_type') userType: string,
    @Param('itemID', ParseIntPipe) itemID: number,
    @Res() res: FastifyReply,
  ) {
    this._itemService
      .delete({ itemID, userType, userID: +userID })
      .then((message) => res.status(HttpStatus.OK).send({ message }));
  }

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
    @Query('order') order: string,
    @Res()
    res: FastifyReply,
  ) {
    this._itemService
      .itemHistoric({
        itemID,
        order,
        skip: +skip,
        take: +take,
        userType,
        userID: +userID,
      })
      .then(([changes, count]) =>
        res.status(HttpStatus.OK).send({
          statusCode: HttpStatus.OK,
          message: `All changes from item with id = ${itemID}`,
          changes,
          count,
        }),
      );
  }

  @Put(':itemID/update-tags')
  @SetMetadata('roles', ['basic', 'admin', 'mod'])
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

    this._itemService
      .updateItemTags({
        itemID,
        tagIDs,
        userID: +userID,
        userType,
      })
      .then((response) => res.status(response.statusCode).send(response));
  }

  @Get(':itemID/related-items')
  @SetMetadata('roles', ['basic', 'admin', 'mod'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  relatedItems(
    @Headers('user_id') userID: string,
    @Headers('user_type') userType: string,
    @Param('itemID', ParseIntPipe) itemID: number,
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Query('order') order: string,
    @Query(
      'tagsID',
      new ParseArrayPipe({ items: Number, optional: true, separator: ',' }),
    )
    tagsID: number[],
    @Res() res: FastifyReply,
  ) {
    this._itemService
      .relatedItems({
        itemID,
        order,
        skip: +skip || 0,
        take: +take || 10,
        userID: +userID,
        userType,
      })
      .then((response) => res.status(response.statusCode).send(response));
  }
}
