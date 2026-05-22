import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';

@Injectable()
export class ModuleCodeValidator {
    constructor(private readonly prisma: PrismaService) { }

    async validate(code: string, currentModuleId?: string): Promise<void> {
        const formattedCode = code.toUpperCase().trim();
        const existing = await this.prisma.module.findUnique({
            where: { code: formattedCode },
        });

        if (existing && existing.id !== currentModuleId) {
            throw new BadRequestException(`The module code '${formattedCode}' It is already registered.`);
        }
    }
}