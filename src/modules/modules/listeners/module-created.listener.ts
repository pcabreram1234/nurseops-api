import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ModuleCreatedEvent } from '../events/module-created.event';
import { MODULE_EVENTS } from '../constants/modules.constants';

@Injectable()
export class ModuleCreatedListener {
    @OnEvent(MODULE_EVENTS.CREATED)
    handleModuleCreated(event: ModuleCreatedEvent) {
        console.log(`[AUDIT_MODULE]: New module registered '${event.code}' id: ${event.moduleId}`);
    }
}