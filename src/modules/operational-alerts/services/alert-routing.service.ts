import { Injectable } from '@nestjs/common';
import { AlertNotificationService } from './alert-notification.service';
import { AlertChannel } from '../enums/alert-channel.enum';

@Injectable()
export class AlertRoutingService {
    constructor(private readonly notificationService: AlertNotificationService) { }

    async routeAlertToDepartmentSupervisor(alertId: string, departmentId: string, message: string): Promise<void> {
        // Busca supervisores asociados al departamento e inyecta la notificación en sus dispositivos
        await this.notificationService.dispatch(alertId, 'CLINICAL_SUPERVISOR', AlertChannel.IN_APP, message);
    }
}