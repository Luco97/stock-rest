import {
  Get,
  Res,
  Body,
  Post,
  Param,
  Query,
  UseGuards,
  Controller,
  SetMetadata,
  ParseIntPipe,
} from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AlphanumericPipe } from '@shared/pipes';
import { CreateTag, UpdateTags } from '@dto/tag';
import { RoleGuard } from '../guards/role.guard';
import { TagService } from '../services/tag.service';

@Controller('tag')
export class TagController {
  constructor(private _tagService: TagService) {}

  @Get()
  findAll(
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Query('term', AlphanumericPipe) term: string,
    @Res() res: FastifyReply,
  ) {
    this._tagService
      .findAll({ skip: +skip, take: +take, term })
      .then(([tags, count]) => res.status(HttpStatus.OK).send({ tags, count }));
  }

  @Post('create')
  @SetMetadata('roles', ['admin', 'master'])
  @UseGuards(RoleGuard)
  create(@Body() createTag: CreateTag, @Res() res: FastifyReply) {
    const { description, name } = createTag;

    this._tagService
      .create({ name, description })
      .then((newTag) =>
        res
          .status(HttpStatus.OK)
          .send({ status: HttpStatus.OK, message: 'tag created', tag: newTag }),
      );
  }

  @Post(':tagID/update')
  @SetMetadata('roles', ['admin'])
  @UseGuards(RoleGuard)
  update(
    @Param('tagID', ParseIntPipe) tagID: number,
    @Body() updateTag: UpdateTags,
    @Res() res: FastifyReply,
  ) {
    const { description } = updateTag;

    this._tagService
      .update(tagID, description)
      .then((response) => res.status(response.status).send(response));
  }
}
