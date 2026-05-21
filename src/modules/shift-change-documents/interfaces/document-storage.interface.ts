import type { File as MulterFile } from "multer";

export interface DocumentStorageInterface {
  upload(file: MulterFile): Promise<{
    url: string;
  }>;
}
