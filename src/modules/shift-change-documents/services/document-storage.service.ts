import { Injectable } from "@nestjs/common";
import { File as MulterFile } from "multer";

@Injectable()
export class DocumentStorageService {
  async upload(file: MulterFile) {
    /*
    |--------------------------------------------------------------------------
    | FUTURE AWS S3 / CLOUD STORAGE
    |--------------------------------------------------------------------------
    */

    return {
      url: "https://file-url.com",
    };
  }
}
