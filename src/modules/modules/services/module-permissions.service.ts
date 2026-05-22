import { Injectable } from '@nestjs/common';

@Injectable()
export class ModulePermissionsService {
    async checkModuleAccess(moduleCode: string, userPermissions: string[]): Promise<boolean> {
        const requiredPermission = `ACCESS_MOD_${moduleCode.toUpperCase()}`;
        return userPermissions.includes(requiredPermission) || userPermissions.includes('SUPER');
    }
}