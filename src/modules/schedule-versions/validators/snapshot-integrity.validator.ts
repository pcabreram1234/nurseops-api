import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class SnapshotIntegrityValidator {
  validate(snapshot: any) {
    if (!snapshot) {
      throw new BadRequestException("Invalid snapshot");
    }

    return true;
  }
}
