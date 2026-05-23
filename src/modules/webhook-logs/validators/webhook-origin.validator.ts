import { Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class WebhookOriginValidator {
    validateAllowedIp(ip: string, allowedIps: string[]): void {
        if (allowedIps.length > 0 && !allowedIps.includes(ip)) {
            throw new ForbiddenException(`Origin denied: The IP address ${ip} is not authorized to emit events.`);
        }
    }
}