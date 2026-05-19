import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class RestrictionTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.nurseRestrictionType.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.nurseRestrictionType.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string) {
    const restrictionType = await this.prisma.nurseRestrictionType.findUnique({
      where: {
        id,
      },
    });

    if (!restrictionType) {
      throw new NotFoundException("Restriction type not found");
    }

    return restrictionType;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);

    return this.prisma.nurseRestrictionType.update({
      where: {
        id,
      },

      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.nurseRestrictionType.delete({
      where: {
        id,
      },
    });
  }
}
