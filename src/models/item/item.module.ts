import { Module } from '@nestjs/common';
import { ItemRepoService } from './item-repo.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ItemModel } from './item-model';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [ItemModel] })],
  exports: [ItemRepoService],
  providers: [ItemRepoService],
})
export class ItemModule {}
