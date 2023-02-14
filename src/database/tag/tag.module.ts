import { Module } from '@nestjs/common';
import { TagRepoService } from './tag-repo.service';

@Module({
  providers: [TagRepoService]
})
export class TagModule {}
