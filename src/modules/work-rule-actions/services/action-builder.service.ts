import { Injectable } from "@nestjs/common";

@Injectable()
export class ActionBuilderService {
  build(action: any) {
    return {
      ...action,

      metadata: {
        generatedAt: new Date(),
      },
    };
  }
}
