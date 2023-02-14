import { Module } from '@nestjs/common';
import { UserRepoService } from './user-repo.service';

@Module({
  providers: [UserRepoService]
})
export class UserModule {}
