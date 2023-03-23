import {
  Entity,
  Property,
  PrimaryKey,
  ManyToMany,
  Collection,
  QueryOrder,
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
