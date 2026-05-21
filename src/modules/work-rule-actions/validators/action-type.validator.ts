import { Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class ActionTypeValidator {
  validate(actionType: string) {
    if (!actionType) {
      throw new BadRequestException("Invalid action type");
    }

    return true;
  }
}
