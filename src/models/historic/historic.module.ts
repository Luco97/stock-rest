import { Module } from '@nestjs/common';
import { HistoricRepoService } from './historic-repo.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HistoricModel } from './historic-model';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [HistoricModel] })],
  exports: [HistoricRepoService],
  providers: [HistoricRepoService],
})
export class HistoricModule {}
