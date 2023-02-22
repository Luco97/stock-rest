import { Loaded } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
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
  ) {
    // this.findOne(1).then((tag) => {
    //   console.log('--->  ', tag);
    // });
  }

  findAll(params: {
    take: number;
    skip: number;
    name: string;
  }): Promise<[TagItemsCount[], number]> {
    const { name, skip, take } = params;

    return this._tagItemRepo.findAndCount(
      { name: { $ilike: `%${name}%` } },
      {
        limit: take,
        offset: take * skip,
        // orderBy: { name: QueryOrderNumeric.ASC },
      },
    );
  }

  findOne(id: number): Promise<TagItemsCount> {
    return this._tagItemRepo.findOne({ id });
  }

  // Admin only
  create(params: { name: string; description: string }) {
    const { description, name } = params;

    return this._tagRepo.persistAndFlush(
      this._tagRepo.create({ name, description }),
    );
  }

  // Admin only
  update(id: number, description: string) {
    return this._tagRepo
      .createQueryBuilder('tag')
      .update({ description })
      .where({ id })
      .execute('get');
  }
}
