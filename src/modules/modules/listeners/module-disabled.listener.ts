import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ModuleDisabledEvent } from '../events/module-disabled.event';
import { MODULE_EVENTS } from '../constants/modules.constants';

@Injectable()
export class ModuleDisabledListener {
    @OnEvent(MODULE_EVENTS.DISABLED)
    handleModuleDisabled(event: ModuleDisabledEvent) {
        console.warn(`[ALERTA_SISTEMA]: Module '${event.code}' was deactivated. Access will be revoked dynamically..`);
    }
}