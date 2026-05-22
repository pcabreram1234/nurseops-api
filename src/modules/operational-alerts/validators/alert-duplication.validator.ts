import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { OperationalAlertyTypes } from '@prisma/client';

@Injectable()
export class AlertDuplicationValidator {
    constructor(private readonly prisma: PrismaService) { }

    async checkActiveDuplicate(departmentId: string, type: OperationalAlertyTypes): Promise<void> {
        const existing = await this.prisma.operationalAlert.findFirst({
            where: {
                departmentId,
                alertType: type,
                status: 'IN_PROGRESS',
            },
        });

        if (existing) {
            throw new BadRequestException(`There is already an alert of this type '${type}' active for this clinical department.`);
        }
    }
} 