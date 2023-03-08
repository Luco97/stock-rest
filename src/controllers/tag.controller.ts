import { TagRepoService } from '@models/tag';
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
import { AlphanumericPipe } from '@shared/pipes';
import { FastifyReply } from 'fastify';
import { RoleGuard } from '../guards/role.guard';
import { CreateTag, UpdateTags } from '@dto/tag';
import { HttpStatus } from '@nestjs/common';

@Controller('tag')
export class TagController {
  constructor(private _tagRepo: TagRepoService) {}

  @Get()
  findAll(
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Query('term', AlphanumericPipe) term: string,
    @Res() res: FastifyReply,
  ) {
    this._tagRepo
      .findAll({
        take: +take || 10,
        skip: +skip || 0,
        name: term || '',
      })
      .then(([tags, count]) => res.status(HttpStatus.OK).send({ tags, count }));
  }

  @Post('create')
  @SetMetadata('roles', ['admin', 'master'])
  @UseGuards(RoleGuard)
  create(@Body() createTag: CreateTag, @Res() res: FastifyReply) {
    const { description, name } = createTag;

    this._tagRepo
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

    this._tagRepo.findAllByID([tagID]).then(([tag]) => {
      if (!tag)
        res
          .status(HttpStatus.OK)
          .send({ status: HttpStatus.OK, message: 'no tag with that id' });
      else
        this._tagRepo.update(description, tag).then((newTag) =>
          res.status(HttpStatus.OK).send({
            status: HttpStatus.OK,
            message: `tag with id = ${newTag.id} updated`,
            tag: newTag,
          }),
        );
    });
  }
}
