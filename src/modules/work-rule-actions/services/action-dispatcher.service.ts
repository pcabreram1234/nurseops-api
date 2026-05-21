import { Injectable } from "@nestjs/common";

import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class ActionDispatcherService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async dispatch(
    action: any,

    payload: any,
  ) {
    this.eventEmitter.emit("work-rule-action.dispatched", {
      action,
      payload,
    });

    return {
      dispatched: true,
    };
  }
}
