import { ItemModel } from '../item/item-model';
import { ManyToOne, Property, PrimaryKey, Entity } from '@mikro-orm/core';

@Entity()
export class HistoricModel {
  @PrimaryKey()
  id: number;

  @Property()
  change!: string;

  @Property({ nullable: true })
  previousValue: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date;

  @ManyToOne(() => ItemModel)
  item!: ItemModel;
}
