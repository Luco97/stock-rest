import { Inject, Injectable, Logger } from '@nestjs/common';
import { v2, UploadApiResponse } from 'cloudinary';

import { CloudinaryConfig } from '../interface/cloudinary-config.interface';

@Injectable()
export class CloudinaryService {
  private _cloudinary = v2;
  private readonly _logger = new Logger(CloudinaryService.name);

  constructor(
    @Inject('CLOUDINARY_CONFIG') private _cloudinaryConfig: CloudinaryConfig,
  ) {
    this._cloudinary.config({
      cloud_name: _cloudinaryConfig.cloud_name,
      api_key: _cloudinaryConfig.api_key,
      api_secret: _cloudinaryConfig.api_secret,
      secure: _cloudinaryConfig.secure,
    });
    this._cloudinary.api
      .ping({}, (err, cr) => {
        if (err)
          this._logger.error('Error with Cloudinary server, no connection :c');
        else this._logger.log('Cloudinary servers status Oks c: ');
      })
      .then(() => {});
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

  delete(public_id: string): Promise<any> {
    this._cloudinary.uploader.rename
    return this._cloudinary.uploader.destroy(public_id);
  }


}
