import { Injectable } from "@nestjs/common";

@Injectable()
export class CoveragePolicyService {
  canUseExternalSupport(configuration: any) {
    return configuration.allow_external_support;
  }

  canAssignDoubleShift(configuration: any) {
    return configuration.allow_double_shift;
  }
}
