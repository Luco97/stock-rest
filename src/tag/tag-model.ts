import {
  Entity,
  Property,
  PrimaryKey,
  ManyToMany,
  Collection,
} from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { ItemModel } from '../item/item-model';

@Entity()
export class TagModel {
  @PrimaryKey()
  id: number;

  @Property()
  name!: string;

  @Property()
  description: string;

  @ManyToMany(() => ItemModel, (item) => item.tags)
  items: Collection<ItemModel> = new Collection<ItemModel>(this);
}

@Entity({
  expression: (em: EntityManager) => {
    return em
      .createQueryBuilder(TagModel, 'tag')
      .select([
        'tag.id as id',
        'tag.name as name',
        'tag.description as description',
        'COUNT(items.id) as item_count',
      ])
      .leftJoin('tag.items', 'items')
      .groupBy('tag.id');
  },
})
export class TagItemsCount {
  @Property()
  id: number;

  @Property()
  name: string;

  @Property()
  itemCount: number;

  @Property()
  description: string;
}
