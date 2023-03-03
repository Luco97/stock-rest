import {
  Controller,
  Get,
  Res,
  Param,
  Query,
  Headers,
  UseGuards,
  SetMetadata,
  HttpStatus,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { RoleGuard } from '../guards/role.guard';
import { GetTokenInterceptor } from '../interceptors/get-token.interceptor';
import { HistoricRepoService } from '@models/historic';

@Controller('changes')
export class HistoricController {
  constructor(private _historicRepo: HistoricRepoService) {}

  @Get(':itemID')
  @SetMetadata('roles', ['basic', 'admin'])
  @UseGuards(RoleGuard)
  @UseInterceptors(GetTokenInterceptor)
  changes(
    @Headers() headers,
    @Param('itemID', ParseIntPipe) itemID: number,
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Query('orderBy') orderBy: string,
    @Res()
    res: FastifyReply,
  ) {
    const userID: number = +headers['user_id'];

    this._historicRepo
      .findItemChanges({
        userID,
        itemID,
        rol: 'admin',
        orderBy: ['ASC', 'DESC'].includes(orderBy)
          ? (orderBy as 'ASC' | 'DESC')
          : 'ASC',
        take: +take || 5,
        skip: +skip || 0,
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
}
