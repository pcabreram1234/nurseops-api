import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { ActivityFeedDto } from '../dto/activity-feed.dto';
import { ActivityCacheService } from './activity-cache.service';

@Injectable()
export class ActivityFeedService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: ActivityCacheService,
    ) { }

    async getOperationalFeed(dto: ActivityFeedDto) {
        const skip = (dto.page - 1) * dto.limit;

        // Solo leer caché en la primera página sin filtros específicos
        if (dto.page === 1 && !dto.severity) {
            const cached = await this.cache.getLatestFeed();
            if (cached) return cached;
        }

        const logs = await this.prisma.activityLog.findMany({
            take: dto.limit,
            skip: skip,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        });

        const formattedFeed = logs.map((log) => ({
            id: log.id,
            userId: log.userId,
            userName: log.user?.name || 'Automated System',
            action: log.action,
            details: log.details,
            timestamp: log.createdAt,
        }));

        if (dto.page === 1 && !dto.severity) {
            await this.cache.setLatestFeed(formattedFeed);
        }

        return formattedFeed;
    }
}