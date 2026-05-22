import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ModuleUpdatedEvent } from '../events/module-updated.event';
import { MODULE_EVENTS } from '../constants/modules.constants';

@Injectable()
export class ModuleUpdatedListener {
    @OnEvent(MODULE_EVENTS.UPDATED)
    handleModuleUpdated(event: ModuleUpdatedEvent) {
        console.log(`[AUDIT_MODULE]: Module '${event.code}' structurally updated.`);
    }
}