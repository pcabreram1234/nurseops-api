import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class EmergencyCoveragesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.emergencyCoverages.create({
      data: dto,
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.emergencyCoverages.findMany({
      where: {
        organizationId,
      },

      include: {
        nurse: true,

        shift: true,

        department: true,

        emergencyCandidates: true,
      },
    });
  }

  async findOne(id: string) {
    const coverage = await this.prisma.emergencyCoverages.findUnique({
      where: { id },
    });

    if (!coverage) {
      throw new NotFoundException("Emergency coverage not found");
    }

    return coverage;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);

    return this.prisma.emergencyCoverages.update({
      where: { id },

      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.emergencyCoverages.delete({
      where: { id },
    });
  }
}
