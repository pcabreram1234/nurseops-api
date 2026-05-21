import { Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class ActionValueValidator {
  validate(value: any) {
    if (value === undefined) {
      throw new BadRequestException("Invalid action value");
    }

    return true;
  }
}
