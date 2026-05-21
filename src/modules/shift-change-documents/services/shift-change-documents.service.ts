import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class ShiftChangeDocumentsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: any) {
        return this.prisma.shiftChangeDocument.create({
            data: dto,
        });
    }

    async findAll(user: any) {
        return this.prisma.shiftChangeDocument.findMany({
            where: {
                organizationId: user.organizationId,

                deletedAt: null,
            },
        });
    }

    async findOne(
        id: string,

        user: any,
    ) {
        const document = await this.prisma.shiftChangeDocument.findFirst({
            where: {
                id,

                organizationId: user.organizationId,

                deletedAt: null,
            },
        });

        if (!document) {
            throw new NotFoundException("Document not found");
        }

        return document;
    }

    async softDelete(id: string) {
        return this.prisma.shiftChangeDocument.update({
            where: { id },

            data: {
                deletedAt: new Date(),
            },
        });
    }
    async upload(file: any, dto: any, user: any) {
        return "Prueba";
    }

    async update(file: any, dto: any) {
        return "Prueba";
    }

    async verify(file: any, dto: any, user: any) {
        return "Prueba";
    }
}
