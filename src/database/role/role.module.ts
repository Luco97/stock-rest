import { Module } from '@nestjs/common';
import { RoleRepoService } from './role-repo.service';

@Module({
  providers: [RoleRepoService]
})
export class RoleModule {}
