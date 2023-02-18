import {
  Module,
  NestModule,
  OnModuleInit,
  MiddlewareConsumer,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { UserModule } from './user/user.module';
import { ItemModule } from './item/item.module';
import { TagModule } from './tag/tag.module';
import { HistoricModule } from './historic/historic.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    UserModule,
    ItemModule,
    TagModule,
    HistoricModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private _orm: MikroORM) {}
  async onModuleInit() {
    await this._orm.getMigrator().up();
  }

  configure(consumer: MiddlewareConsumer) {}
}
