import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class ShiftTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.shiftTemplate.create({
      data: dto,
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.shiftTemplate.findMany({
      where: {
        organizationId,
      },

      include: {
        department: true,
      },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.shiftTemplate.findUnique({
      where: { id },

      include: {
        department: true,
      },
    });

    if (!template) {
      throw new NotFoundException("Shift template not found");
    }

    return template;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);

    return this.prisma.shiftTemplate.update({
      where: { id },

      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.shiftTemplate.delete({
      where: { id },
    });
  }
}
