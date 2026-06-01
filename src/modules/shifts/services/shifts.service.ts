import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: any) {
    return this.prisma.shift.create({
      data: dto,
      include: {
        department: true,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.shift.findMany({
      where: {
        organizationId: user.organizationId,

        ...(query.search && {
          OR: [
            {
              name: {
                contains: query.search,
                mode: "insensitive",
              },
            },
            {
              code: {
                contains: query.search,
                mode: "insensitive",
              },
            },
          ],
        }),

        ...(query.departmentId && {
          departmentId: query.departmentId,
        }),

        ...(query.type && {
          type: query.type,
        }),

        ...(query.isNightShift !== undefined && {
          // Aseguramos la conversión a booleano si viene como string desde la URL
          isNightShift: query.isNightShift === 'true' || query.isNightShift === true,
        }),

        ...(query.isEmergencyShift !== undefined && {
          isEmergencyShift: query.isEmergencyShift === 'true' || query.isEmergencyShift === true,
        }),

        // 🕒 NUEVO: Filtro por rango de inicio del turno (startTime)
        ...(query.startDate && {
          startTime: {
            gte: new Date(query.startDate),
          },
        }),

        // 🕒 NUEVO: Filtro por rango de finalización del turno (endTime)
        ...(query.endDate && {
          endTime: {
            lte: new Date(query.endDate),
          },
        }),

        /* 💡 NOTA DE ARQUITECTURA: 
          Si el frontend envía un día específico (ej: "2026-06-01") y quieres buscar 
          todos los turnos que EMPIECEN dentro de ese día, puedes estructurarlo así:
          
          ...(query.startDate && query.endDate && {
            startTime: {
              gte: new Date(query.startDate), // Ejemplo: 2026-06-01T00:00:00.000Z
              lte: new Date(query.endDate),   // Ejemplo: 2026-06-01T23:59:59.999Z
            }
          })
        */
      },

      include: {
        department: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string, user: any) {
    const shift = await this.prisma.shift.findFirst({
      where: {
        id,

        organizationId: user.organizationId,
      },

      include: {
        department: true,

        scheduleEntries: true,
      },
    });

    if (!shift) {
      throw new NotFoundException("Shift not found");
    }

    return shift;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);

    return this.prisma.shift.update({
      where: {
        id,
      },

      data: dto,
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);

    return this.prisma.shift.delete({
      where: {
        id,
      },
    });
  }
}
