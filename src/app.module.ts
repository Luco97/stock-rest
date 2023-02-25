import {
  Module,
  NestModule,
  OnModuleInit,
  MiddlewareConsumer,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MikroORM } from '@mikro-orm/core';

// Modulos
import { AuthModule } from '@shared/auth';
import { TagModule } from '@models/tag';
import { UserModule } from '@models/user';
import { ItemModule } from '@models/item';
import { HistoricModule } from '@models/historic';
import { MikroOrmModule } from '@mikro-orm/nestjs';

// Controladores
import { AuthController } from './controllers/auth.controller';
import { TagController } from './controllers/tag.controller';
import { ItemController } from './controllers/item.controller';
import { HistoricController } from './controllers/historic.controller';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    UserModule,
    ItemModule,
    TagModule,
    HistoricModule,
    AuthModule,
  ],
  controllers: [
    AppController,
    AuthController,
    TagController,
    ItemController,
    HistoricController,
  ],
  providers: [AppService],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private _orm: MikroORM) {}
  async onModuleInit() {
    await this._orm.getMigrator().up();
  }

  configure(consumer: MiddlewareConsumer) {}
}
