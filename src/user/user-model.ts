import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Enum,
  BeforeCreate,
} from '@mikro-orm/core';
import { genSalt, hash } from 'bcrypt';
import { ItemModel } from '../item/item-model';
import { UserTypes } from './user.enum';

@Entity()
export class UserModel {
  @PrimaryKey()
  id: number;

  @Property()
  email!: string;

  @Property()
  username!: string;

  @Property({ lazy: true })
  password!: string;

  @Enum(() => UserTypes)
  type!: string;

  @OneToMany(() => ItemModel, (item) => item.user)
  items: Collection<ItemModel> = new Collection<ItemModel>(this);

  @BeforeCreate()
  async hashPass() {
    if (!this.password) return;
    const saltRound: number = 10;
    return new Promise((resolve, reject) => {
      genSalt(saltRound).then((bcSaltRound) =>
        hash(this.password, bcSaltRound)
          .then((hashPass) => resolve((this.password = hashPass)))
          .catch((error) => reject(error)),
      );
    });
  }
}
