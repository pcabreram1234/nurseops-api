import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class TemplateValidationService {
  validateTimeRange(
    startTime: string,

    endTime: string,
  ) {
    if (startTime >= endTime) {
      throw new BadRequestException("Invalid shift time range");
    }

    return true;
  }
}
