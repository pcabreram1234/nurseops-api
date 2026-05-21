import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class DepartmentConfigurationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.departmentConfiguration.create({
      data: dto,
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.departmentConfiguration.findMany({
      where: {
        organizationId,
      },

      include: {
        department: true,
      },
    });
  }

  async findOne(id: string) {
    const configuration = await this.prisma.departmentConfiguration.findUnique({
      where: { id },

      include: {
        department: true,
      },
    });

    if (!configuration) {
      throw new NotFoundException("Department configuration not found");
    }

    return configuration;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);

    return this.prisma.departmentConfiguration.update({
      where: { id },

      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.departmentConfiguration.delete({
      where: { id },
    });
  }
}
