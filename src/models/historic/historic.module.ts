import { Module } from '@nestjs/common';
import { HistoricRepoService } from './historic-repo.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HistoricModel } from './historic-model';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [HistoricModel] })],
  providers: [HistoricRepoService],
})
export class HistoricModule {}
