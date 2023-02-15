import { Module } from '@nestjs/common';
import { ItemModule } from './item/item.module';
import { UserModule } from './user/user.module';
import { TagModule } from './tag/tag.module';
import { HistoricModule } from './historic/historic.module';

@Module({
  imports: [ItemModule, UserModule, TagModule, HistoricModule],
})
export class DatabaseModule {}
