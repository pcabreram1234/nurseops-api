import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";
import { ProviderList as IntegrationProvider } from "@prisma/client";

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.integration.create({
      data: dto,
    });
  }

  async findAll(query: any, organizationId: string) {
    const where = {
      organizationId,
      ...(query.provider && { provider: query.provider }),
      ...(query.name && { name: { contains: query.name, mode: "insensitive" as const } }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: "insensitive" as const } },
          { provider: { contains: query.search, mode: "insensitive" as const } },
        ],
      }),
    };

    const orderBy = { createdAt: "desc" as const };

    // Paginación opcional
    if (query.page || query.limit) {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(500, Math.max(1, Number(query.limit) || 25));
      const [data, total] = await Promise.all([
        this.prisma.integration.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.integration.count({ where }),
      ]);
      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    return this.prisma.integration.findMany({
      where,
      orderBy,
    });
  }

  async findOne(id: string) {
    const integration = await this.prisma.integration.findUnique({
      where: { id },
    });

    if (!integration) {
      throw new NotFoundException("Integration not found");
    }

    return integration;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);

    return this.prisma.integration.update({
      where: { id },

      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.integration.delete({
      where: { id },
    });
  }
}
