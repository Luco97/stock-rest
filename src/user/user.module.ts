import { Module } from '@nestjs/common';
import { UserRepoService } from './user-repo.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserModel } from './user-model';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [UserModel] })],
  providers: [UserRepoService],
})
export class UserModule {}
