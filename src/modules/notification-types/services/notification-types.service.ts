import {
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class NotificationTypesService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(dto: any) {
        return this.prisma.notificationType.create({
            data: dto,
        });
    }

    async findAll(
        filters: any,

        user: any,
    ) {
        return this.prisma.notificationType.findMany({
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
        const type =
            await this.prisma.notificationType.findFirst({
                where: {
                    id,

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

        if (!type) {
            throw new NotFoundException(
                "Notification type not found",
            );
        }

        return type;
    }

    async update(
        id: string,

        dto: any,
    ) {
        return this.prisma.notificationType.update({
            where: { id },

            data: dto,
        });
    }

    async remove(
        id: string,
    ) {
        return this.prisma.notificationType.update({
            where: { id },

            data: {
                deletedAt:
                    new Date(),
            },
        });
    }
}