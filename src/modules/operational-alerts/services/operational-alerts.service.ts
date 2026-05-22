import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { OperationalAlertFilterDto } from '../dto/operational-alert-filter.dto';

@Injectable()
export class OperationalAlertsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(filters: OperationalAlertFilterDto) {
        return this.prisma.operationalAlert.findMany({
            where: {
                ...(filters.departmentId && { departmentId: filters.departmentId }),
                ...(filters.status && { status: filters.status }),
                ...(filters.severity && { severity: filters.severity }),
            },
            orderBy: { severity: 'desc' },
        });
    }

    async findOne(id: string) {
        const alert = await this.prisma.operationalAlert.findUnique({ where: { id } });
        if (!alert) throw new NotFoundException('Non-existent operational alert.');
        return alert;
    }
}