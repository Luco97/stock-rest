import {
  Module,
  NestModule,
  OnModuleInit,
  RequestMethod,
  MiddlewareConsumer,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';

// Modulos
import { TagModule } from '@models/tag';
import { AuthModule } from '@shared/auth';
import { UserModule } from '@models/user';
import { ItemModule } from '@models/item';
import { HistoricModule } from '@models/historic';
import { CloudinaryModule } from '@shared/cloudinary';

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
    ConfigModule.forRoot(),
    MikroOrmModule.forRoot(),
    UserModule,
    ItemModule,
    TagModule,
    HistoricModule,
    AuthModule,
    CloudinaryModule.forRoot({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    }),
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
        { path: 'auth/*', method: RequestMethod.PUT },
        { path: 'auth/*', method: RequestMethod.GET },
        { path: 'auth/reset-pass', method: RequestMethod.POST },
        { path: 'auth/confirm-pass', method: RequestMethod.POST },
        { path: 'auth/validate-token', method: RequestMethod.POST },
        TagController,
        ItemController,
      );
  }
}
