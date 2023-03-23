import { EntityManager } from '@mikro-orm/postgresql';
import { Entity, Property, QueryOrder } from '@mikro-orm/core';

import { TagModel } from './tag-model';

@Entity({
  expression: (em: EntityManager) => {
    return em
      .createQueryBuilder(TagModel, 'tag')
      .select([
        'tag.id',
        'tag.name',
        'tag.description',
        'COUNT(items.id) as item_count',
      ])
      .leftJoin('tag.items', 'items')
      .groupBy('tag.id')
      .orderBy({ name: QueryOrder.ASC });
  },
  virtual: true,
})
export class TagItemsCount {
  @Property()
  id!: number;

  @Property()
  name!: string;

  @Property()
  description!: string;

  @Property()
  itemCount!: number;
}
