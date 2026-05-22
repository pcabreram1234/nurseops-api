import { Injectable } from '@nestjs/common';
import { WORKLOAD_CACHE_KEYS } from '../constants/workload-metrics.constants';

@Injectable()
export class WorkloadCacheService {
    private cache = new Map<string, any>();

    async getNurseMetrics(nurseId: string, month: number, year: number): Promise<any | null> {
        const key = WORKLOAD_CACHE_KEYS.NURSE_METRICS(nurseId, month, year);
        return this.cache.get(key) || null;
    }

    async setNurseMetrics(nurseId: string, month: number, year: number, data: any): Promise<void> {
        const key = WORKLOAD_CACHE_KEYS.NURSE_METRICS(nurseId, month, year);
        this.cache.set(key, data);
    }

    async invalidateNurseCache(nurseId: string, month: number, year: number): Promise<void> {
        this.cache.delete(WORKLOAD_CACHE_KEYS.NURSE_METRICS(nurseId, month, year));
    }
}