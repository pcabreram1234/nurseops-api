import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';

@Injectable()
export class ActivityUserValidator {
    constructor(private readonly prisma: PrismaService) { }

    async verifyUserExists(userId: string): Promise<void> {
        const userExists = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });

        if (!userExists) {
            throw new NotFoundException(`The user with ID '${userId}' It is not registered in the system.`);
        }
    }
}