import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Enum,
} from '@mikro-orm/core';
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
}
