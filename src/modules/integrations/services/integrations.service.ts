import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.integration.create({
      data: dto,
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.integration.findMany({
      where: {
        organizationId,
      },
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
