import { Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class FeaturePermissionValidator {
    validateAdminAccess(userRoles: string[]): void {
        if (!userRoles.includes('ADMIN') && !userRoles.includes('SUPER_ADMIN')) {
            throw new ForbiddenException('Access denied: Only DevOps or Administration personnel can alter Feature Flags.');
        }
    }
}