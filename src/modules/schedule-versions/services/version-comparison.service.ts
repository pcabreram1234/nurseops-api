import { Injectable } from "@nestjs/common";

@Injectable()
export class VersionComparisonService {
  compare(
    source: any,

    target: any,
  ) {
    /*
    |--------------------------------------------------------------------------
    | FUTURE DIFF ENGINE
    |--------------------------------------------------------------------------
    */

    return {
      differences: [],
    };
  }
}
