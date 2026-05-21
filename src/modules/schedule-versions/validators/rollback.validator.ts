import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class RollbackValidator {
  validate(rollbackable: boolean) {
    if (!rollbackable) {
      throw new BadRequestException("Version cannot be restored");
    }

    return true;
  }
}
