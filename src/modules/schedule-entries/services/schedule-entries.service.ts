import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class ScheduleEntriesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: any, user: any) {
    return this.prisma.scheduleEntry.create({
      data: {
        ...dto,
        organizationId: user.organizationId,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.scheduleEntry.findMany({
      where: {
        organizationId: user.organizationId,
        ...(query.scheduleId && {
          scheduleId: query.scheduleId,
        }),
        ...(query.nurseId && {
          nurseId: query.nurseId,
        }),
        ...(query.shiftId && {
          shiftId: query.shiftId,
        }),
        ...(query.startDate &&
          query.endDate && {
          date: {
            gte: new Date(query.startDate),
            lte: new Date(query.endDate),
          },
        }),
      },
      select: {
        id: true,
        scheduleId: true,
        shiftId: true,
        date: true,
        status: true,
        nurseId: true,
        notes: true,
        isEmergencyCoverage: true,
        // 🌟 Las relaciones se incluyen usando select internos:
        nurse: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },
        shift: true,    // Trae todos los campos del shift
        schedule: true, // Trae todos los campos del schedule
        shiftTemplate: {
          select: {
            name: true,
            department: {
              select: { name: true, description: true }
            }
          }
        },
      },
      orderBy: {
        date: "asc",
      },
    });
  }

  async findOne(id: string, user: any) {
    const entry = await this.prisma.scheduleEntry.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        nurse: {
          include: {
            user: {
              select: {
                firstName: true
              }
            }
          }
        },
        shift: true,
      },
    });

    if (!entry) {
      throw new NotFoundException("Schedule entry not found");
    }

    return entry;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.scheduleEntry.update({
      where: {
        id,
      },

      data: dto,
    });
  }
}
