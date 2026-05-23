import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class ShiftTemplatesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: any) {
    return this.prisma.shiftTemplate.create({
      data: dto,
    });
  }

  async findAll(user: any) {
    const isSuperAdmin = user.role === "SUPER"
    return this.prisma.shiftTemplate.findMany({
      where: isSuperAdmin ? {

      } : { organizationId: user.organizationId },
      include: {
        department: true,
      },
    });
  }

  async findOne(id: string, user: any) {
    const isSuperAdmin = user.role === "SUPER"
    const template = await this.prisma.shiftTemplate.findFirst({
      where: isSuperAdmin ? { id } : { organizationId: user.organizationId, id: id },
      include: {
        department: true,
      },
    });

    if (!template) {
      throw new NotFoundException("Shift template not found");
    }

    return template;
  }

  async update(id: string, dto: any, user: any) {
    const isSuperAdmin = user.role === "SUPER"
    await this.findOne(id, user);
    return this.prisma.shiftTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);

    return this.prisma.shiftTemplate.delete({
      where: { id },
    });
  }
}
