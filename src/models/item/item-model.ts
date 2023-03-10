import {
  Entity,
  Property,
  OneToMany,
  ManyToOne,
  Collection,
  ManyToMany,
  PrimaryKey,
  Cascade,
} from '@mikro-orm/core';

import { TagModel } from '../tag/tag-model';
import { UserModel } from '../user/user-model';
import { HistoricModel } from '../historic/historic-model';

@Entity()
export class ItemModel {
  @PrimaryKey()
  id: number;

  @Property()
  name!: string;

  @Property()
  stock: number;

  @Property()
  price: number;

  @Property()
  imageUrl: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => UserModel)
  user!: UserModel;

  @OneToMany(() => HistoricModel, (historic) => historic.item, {
    cascade: [Cascade.REMOVE],
  })
  changes: Collection<HistoricModel> = new Collection<HistoricModel>(this);

  @ManyToMany(() => TagModel, 'items', {
    owner: true,
    cascade: [],
  })
  tags: Collection<TagModel> = new Collection<TagModel>(this);
}
