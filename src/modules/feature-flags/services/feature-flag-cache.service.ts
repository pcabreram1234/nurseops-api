import { Injectable } from '@nestjs/common';
import { FEATURE_CACHE_KEYS } from '../constants/feature-flags.constants';

@Injectable()
export class FeatureFlagCacheService {
    private cache = new Map<string, boolean>();

    async getFlagStatus(name: string): Promise<boolean | null> {
        const status = this.cache.get(FEATURE_CACHE_KEYS.FLAG_STATUS(name));
        return status !== undefined ? status : null;
    }

    async setFlagStatus(name: string, isActive: boolean): Promise<void> {
        this.cache.set(FEATURE_CACHE_KEYS.FLAG_STATUS(name), isActive);
    }

    async invalidateFlag(name: string): Promise<void> {
        this.cache.delete(FEATURE_CACHE_KEYS.FLAG_STATUS(name));
    }
}