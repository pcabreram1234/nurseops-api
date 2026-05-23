import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class WebhookSignatureValidator {
    validate(hasSignature: boolean): void {
        if (!hasSignature) {
            throw new UnauthorizedException('Cryptographic signature missing or invalid in webhook headers.');
        }
    }
}