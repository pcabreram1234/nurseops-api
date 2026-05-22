import {
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class NotificationTemplatesService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(dto: any) {
        return this.prisma.notificationTemplates.create({
            data: dto,
        });
    }

    async findAll(
        filters: any,

        user: any,
    ) {
        return this.prisma.notificationTemplates.findMany({
            where: {
                deletedAt: null,

                OR: [
                    {
                        organizationId:
                            user.organizationId,
                    },

                    {
                        organizationId: null,
                    },
                ],
            },
        });
    }

    async findOne(
        id: string,

        user: any,
    ) {
        const template =
            await this.prisma.notificationTemplates.findFirst({
                where: {
                    id,

                    deletedAt: null,
                },
            });

        if (!template) {
            throw new NotFoundException(
                "Template not found",
            );
        }

        return template;
    }

    async update(
        id: string,

        dto: any,
    ) {
        return this.prisma.notificationTemplates.update({
            where: { id },

            data: dto,
        });
    }

    async remove(
        id: string,
    ) {
        return this.prisma.notificationTemplates.update({
            where: { id },

            data: {
                deletedAt:
                    new Date(),
            },
        });
    }
}