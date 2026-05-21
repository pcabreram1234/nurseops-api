import { Injectable } from "@nestjs/common";
import { File as MulterFile } from "multer";

@Injectable()
export class DocumentVirusScanService {
  async scan(file: MulterFile) {
    return {
      infected: false,
    };
  }
}
