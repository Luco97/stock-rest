import {
  Module,
  NestModule,
  OnModuleInit,
  RequestMethod,
  MiddlewareConsumer,
} from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';

// Modulos
import { TagModule } from '@models/tag';
import { AuthModule } from '@shared/auth';
import { UserModule } from '@models/user';
import { ItemModule } from '@models/item';
import { HistoricModule } from '@models/historic';
import { MikroOrmModule } from '@mikro-orm/nestjs';

// Controladores
import { TagController } from './controllers/tag.controller';
import { AuthController } from './controllers/auth.controller';
import { ItemController } from './controllers/item.controller';

// Servicios
import { TagService } from './services/tag.service';
import { UserService } from './services/user.service';
import { ItemService } from './services/item.service';

// Middleware
import { BearerTokenMiddleware } from './middleware/bearer-token.middleware';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    UserModule,
    ItemModule,
    TagModule,
    HistoricModule,
    AuthModule,
  ],
  controllers: [AuthController, TagController, ItemController],
  providers: [TagService, UserService, ItemService],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private _orm: MikroORM) {}
  async onModuleInit() {
    await this._orm.getMigrator().up();
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BearerTokenMiddleware)
      .forRoutes(
        { path: 'auth/validate-token', method: RequestMethod.POST },
        TagController,
        ItemController,
      );
  }
}
