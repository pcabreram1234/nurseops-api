import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class NursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, user: any) {
    return this.prisma.nurse.create({
      data: {
        ...dto,
        organizationId: user.organizationId,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.nurse.findMany({
      where: {
        organizationId: user.organizationId,
      },
    });
  }

  async findOne(id: string, user: any) {
    const nurse = await this.prisma.nurse.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },

      include: {
        workLoadMetrics: true,
      },
    });

    if (!nurse) {
      throw new NotFoundException("Nurse not found");
    }

    return nurse;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);

    return this.prisma.nurse.update({
      where: {
        id,
      },

      data: dto,
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);

    return this.prisma.nurse.delete({
      where: {
        id,
      },
    });
  }
}
