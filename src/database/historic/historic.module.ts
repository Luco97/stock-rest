import { Module } from '@nestjs/common';
import { HistoricRepoService } from './historic-repo.service';

@Module({
  providers: [HistoricRepoService]
})
export class HistoricModule {}
