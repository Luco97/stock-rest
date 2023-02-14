import { Module } from '@nestjs/common';
import { ItemRepoService } from './item-repo.service';

@Module({
  providers: [ItemRepoService]
})
export class ItemModule {}
