import { Inject, Injectable } from '@nestjs/common';
import { v2, UploadApiResponse } from 'cloudinary';

import { CloudinaryConfig } from '../interface/cloudinary-config.interface';

@Injectable()
export class CloudinaryService {
  private _cloudinary = v2;
  constructor(
    @Inject('CLOUDINARY_CONFIG') private _cloudinaryConfig: CloudinaryConfig,
  ) {
    this._cloudinary.config({
      cloud_name: _cloudinaryConfig.cloud_name,
      api_key: _cloudinaryConfig.api_key,
      api_secret: _cloudinaryConfig.api_secret,
      secure: _cloudinaryConfig.secure,
    });
  }

  upload(
    filePath: string,
    folderParth: string,
    fileName: string,
  ): Promise<UploadApiResponse> {
    return this._cloudinary.uploader.upload(filePath, {
      folder: folderParth,
      public_id: fileName,
    });
  }
}
