import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class NurseRestrictionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, user: any) {
    return this.prisma.nurseRestriction.create({
      data: {
        ...dto,
        organizationId: user.organizationId,
        createdById: user.sub,
      },
      include: {
        nurse: true,
        restrictionType: true,
      },
    });
  }

  async findAll(user: any) {
    return this.prisma.nurseRestriction.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        nurse: true,
        restrictionType: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string, user: any) {
    const restriction = await this.prisma.nurseRestriction.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        nurse: true,
        restrictionType: true,
      },
    });

    if (!restriction) {
      throw new NotFoundException("Restriction not found");
    }

    return restriction;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.nurseRestriction.update({
      where: {
        id,
      },
      data: dto,
      include: {
        nurse: true,
        restrictionType: true,
      },
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);
    return this.prisma.nurseRestriction.delete({
      where: {
        id,
      },
    });
  }
}
