import { Module } from '@nestjs/common';
import { CloudinaryService } from './services/cloudinary.service';

@Module({
  exports: [CloudinaryService],
  providers: [CloudinaryService],
})
export class CloudinaryModule {}
