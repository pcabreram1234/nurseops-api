import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class ShiftTemplateConfigurationValidator {
  validate(configuration: any) {
    if (!configuration) {
      throw new BadRequestException("Invalid configuration");
    }

    return true;
  }
}
