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
    private readonly _tagRepoo: EntityRepository<TagItemsCount>,
  ) {}
}
