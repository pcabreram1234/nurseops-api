import { Injectable } from "@nestjs/common";

@Injectable()
export class FileSizeValidator {
  validate(size: number) {
    return size < 10 * 1024 * 1024;
  }
}
