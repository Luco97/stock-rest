import { Module } from '@nestjs/common';
import { TagRepoService } from './tag-repo.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TagModel, TagItemsCount } from './tag-model';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [TagModel, TagItemsCount] })],
  exports: [TagRepoService],
  providers: [TagRepoService],
})
export class TagModule {}
