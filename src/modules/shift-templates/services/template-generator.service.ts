import { Injectable } from "@nestjs/common";

@Injectable()
export class TemplateGeneratorService {
  async generate(template: any) {
    /*
    |--------------------------------------------------------------------------
    | FUTURE AUTO SHIFT GENERATION
    |--------------------------------------------------------------------------
    */

    return {
      generated: true,
    };
  }
}
