import { DynamicModule, Module } from '@nestjs/common';
import { CloudinaryService } from './services/cloudinary.service';

@Module({
  exports: [CloudinaryService],
  providers: [CloudinaryService],
})
export class CloudinaryModule {
  static forRoot(config: {
    cloud_name: string;
    api_key: string;
    api_secret: string;
    secure: boolean;
  }): DynamicModule {
    return {
      module: CloudinaryModule,
      providers: [
        { provide: 'CLOUDINARY_CONFIG', useValue: config },
        CloudinaryService,
      ],
      exports: [CloudinaryService],
    };
  }
}
