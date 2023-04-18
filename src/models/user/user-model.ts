import {
  Enum,
  Entity,
  Property,
  OneToMany,
  Collection,
  QueryOrder,
  PrimaryKey,
  BeforeCreate,
} from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';

import { UserTypes, hashPass } from './user-const';
import { ItemModel } from '../item/item-model';

@Entity()
export class UserModel {
  @PrimaryKey()
  id: number;

  @Property({ lazy: true })
  email!: string;

  @Property()
  username!: string;

  @Property({ lazy: true })
  password!: string;

  @Enum({ items: () => UserTypes, lazy: true })
  type!: string;

  @OneToMany(() => ItemModel, (item) => item.user)
  items: Collection<ItemModel> = new Collection<ItemModel>(this);

  @BeforeCreate()
  async hashPass() {
    if (!this.password) return;
    const hashedPass: string = await hashPass(this.password);
    this.password = hashedPass;
  }
}

@Entity({
  expression: (em: EntityManager) => {
    return em
      .createQueryBuilder(UserModel, 'user')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.type',
        'COUNT(items.id) as item_count',
      ])
      .leftJoin('user.items', 'items')
      .groupBy('user.id')
      .orderBy({ id: QueryOrder.ASC });
  },
  virtual: true,
})
export class UserItemsCount {
  @Property()
  id!: number;

  @Property({ lazy: true })
  email!: string;

  @Property()
  username!: string;

  @Property()
  type!: string;

  @Property()
  itemCount!: number;
}
