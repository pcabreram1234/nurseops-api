import { Injectable, Logger } from '@nestjs/common';
import { MODULES_CACHE_KEYS } from '../constants/modules.constants';

@Injectable()
export class ModuleCacheService {
    private readonly logger = new Logger(ModuleCacheService.name);
    private memoryCache = new Map<string, any>(); // Simulación en memoria. Reemplazar por Redis o CacheManager si es necesario.

    async getCachedModules(): Promise<any[] | null> {
        return this.memoryCache.get(MODULES_CACHE_KEYS.ALL_MODULES) || null;
    }

    async setCachedModules(modules: any[]): Promise<void> {
        this.memoryCache.set(MODULES_CACHE_KEYS.ALL_MODULES, modules);
        this.logger.log('Internal module catalog cache successfully synchronized.');
    }

    async invalidate(): Promise<void> {
        this.memoryCache.delete(MODULES_CACHE_KEYS.ALL_MODULES);
        this.logger.warn('Module catalog cache invalidated.');
    }
}