import { Injectable } from "@nestjs/common";

@Injectable()
export class TemplateEngineService {
  async evaluate(
    template: any,

    payload: any,
  ) {
    /*
    |--------------------------------------------------------------------------
    | FUTURE TEMPLATE ENGINE
    |--------------------------------------------------------------------------
    */

    return {
      valid: true,
    };
  }
}
