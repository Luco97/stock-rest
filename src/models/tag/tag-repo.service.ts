import { Injectable } from '@nestjs/common';
import { QueryOrderNumeric } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { TagModel, TagItemsCount } from './tag-model';

@Injectable()
export class TagRepoService {
  constructor(
    @InjectRepository(TagModel)
    private readonly _tagRepo: EntityRepository<TagModel>,
    @InjectRepository(TagItemsCount)
    private readonly _tagItemRepo: EntityRepository<TagItemsCount>,
  ) {}

  findAll(params: {
    take: number;
    skip: number;
    name: string;
  }): Promise<[TagModel[] | TagItemsCount[], number]> {
    const { name, skip, take } = params;
    if (!name)
      return this._tagItemRepo.findAndCount(
        {},
        {
          limit: take,
          offset: take * skip,
          // orderBy: { name: QueryOrderNumeric.ASC },
        },
      );
    return this._tagRepo
      .createQueryBuilder('tag')
      .where({ 'lower("tag"."name")': { $ilike: `${name}%` } })
      .limit(take, take * skip)
      .orderBy({ name: QueryOrderNumeric.ASC })
      .getResultAndCount();
  }

  findAllByID(tagID: number[]) {
    return this._tagRepo
      .createQueryBuilder('tag')
      .where({ id: { $in: tagID } })
      .getResult();
  }

  countByName(name: string): Promise<TagModel> {
    return this._tagRepo
      .createQueryBuilder('tag')
      .where({
        'lower("tag"."name")': name
          .replace(/[^A-Za-z0-9|ñ]+/g, '-')
          .toLowerCase(),
      })
      .getSingleResult();
  }

  // findOne(id: number): Promise<TagModel> {
  //   return this._tagRepo.findOne({ id });
  // }

  // Admin only
  create(params: { name: string; description: string }): Promise<TagModel> {
    const { description, name } = params;

    return new Promise<TagModel>((resolve, reject) => {
      const newTag: TagModel = this._tagRepo.create({
        name: name.replace(/[^A-Za-z0-9|ñ]+/g, '-'),
        description,
      });
      this._tagRepo.persistAndFlush(newTag).then(() => resolve(newTag));
    });
  }

  // Admin only
  update(description: string, tag: TagModel) {
    return new Promise<TagModel>((resolve, reject) => {
      tag['description'] = description;
      this._tagRepo.persistAndFlush(tag).then(() => resolve(tag));
    });
  }
}
