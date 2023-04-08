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
import { genSalt, hash } from 'bcrypt';

import { UserTypes } from './user.enum';
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
  async hashPass(pass?: string) {
    if (!(this.password || pass)) return;
    const saltRound: number = 10;
    const newPassword = pass || this.password;
    return new Promise<string>((resolve, reject) => {
      genSalt(saltRound).then((bcSaltRound) =>
        hash(newPassword, bcSaltRound)
          .then((hashPass) => {
            if (!pass) this.password = hashPass;
            resolve(hashPass);
          })
          .catch((error) => reject(error)),
      );
    });
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
