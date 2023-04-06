import { Module } from '@nestjs/common';
import { UserRepoService } from './user-repo.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserItemsCount, UserModel } from './user-model';

@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [UserModel, UserItemsCount] }),
  ],
  exports: [UserRepoService],
  providers: [UserRepoService],
})
export class UserModule {}
