import { Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class ActionPriorityValidator {
  validate(priority: number) {
    if (priority < 1) {
      throw new BadRequestException("Priority must be >= 1");
    }

    return true;
  }
}
