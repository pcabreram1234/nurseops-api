import { Injectable, BadRequestException } from "@nestjs/common";

import { ActionRegistryService } from "./action-registry.service";

@Injectable()
export class ActionExecutorService {
  constructor(private readonly registry: ActionRegistryService) {}

  async execute(
    action: any,

    payload: any,
  ) {
    const handler = this.registry.getHandler(action.action_type);

    if (!handler) {
      throw new BadRequestException(
        `Handler not found for action ${action.action_type}`,
      );
    }

    return handler.execute(action, payload);
  }
}
