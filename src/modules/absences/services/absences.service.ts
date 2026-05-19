import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class AbsencesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, user: any) {
    return this.prisma.absence.create({
      data: {
        ...dto,
        organizationId: user.organizationId,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.absence.findMany({
      where: {
        organizationId: user.organizationId,
        ...(query.nurseId && {
          nurseId: query.nurseId,
        }),
        ...(query.type && {
          type: query.type,
        }),
        ...(query.status && {
          status: query.status,
        }),
        ...(query.startDate &&
          query.endDate && {
            date: {
              gte: new Date(query.startDate),
              lte: new Date(query.endDate),
            },
          }),
      },

      include: {
        nurse: true,
        reporter: true,
        approvedBy: true,
      },

      orderBy: {
        date: "desc",
      },
    });
  }

  async findOne(id: string, user: any) {
    const absence = await this.prisma.absence.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        nurse: true,
        reporter: true,
      },
    });

    if (!absence) {
      throw new NotFoundException("Absence not found");
    }

    return absence;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.absence.update({
      where: {
        id,
      },
      data: dto,
    });
  }
}
