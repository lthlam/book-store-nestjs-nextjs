import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import * as stream from 'stream';

@Injectable()
export class UploadsService {
  uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'book_store' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      const readableStream = new stream.PassThrough();
      readableStream.end(file.buffer);
      readableStream.pipe(upload);
    });
  }
}
