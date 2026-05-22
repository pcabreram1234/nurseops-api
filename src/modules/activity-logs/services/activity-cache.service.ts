import { Injectable } from '@nestjs/common';
import { ACTIVITY_CACHE_KEYS } from '../constants/activity-logs.constants';

@Injectable()
export class ActivityCacheService {
    private memoryCache = new Map<string, any>();

    async getLatestFeed(): Promise<any[] | null> {
        return this.memoryCache.get(ACTIVITY_CACHE_KEYS.LATEST_FEED) || null;
    }

    async setLatestFeed(feed: any[]): Promise<void> {
        this.memoryCache.set(ACTIVITY_CACHE_KEYS.LATEST_FEED, feed);
    }

    async invalidateFeed(): Promise<void> {
        this.memoryCache.delete(ACTIVITY_CACHE_KEYS.LATEST_FEED);
    }
}