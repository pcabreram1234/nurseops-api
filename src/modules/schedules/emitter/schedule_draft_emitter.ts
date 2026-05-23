import { EventEmitter2 } from '@nestjs/event-emitter';

// Recibe el eventEmitter como dependencia (o lo inyectas en la clase si usas POO)
export function triggerDraftReadyNotification(eventEmitter: EventEmitter2, scheduleId: string, departmentId: string) {

    // Dispara el evento y manda los datos necesarios (el "payload")
    eventEmitter.emit('schedule.draft.ready', {
        scheduleId: scheduleId,
        departmentId: departmentId,
        timestamp: new Date()
    });

    console.log(`📢 [Event Emitter] Evento 'schedule.draft.ready' disparado.`);
}