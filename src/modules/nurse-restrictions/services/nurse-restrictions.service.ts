import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class NurseRestrictionsService {
  constructor(private readonly prisma: PrismaService) { }

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

  async findAll(query: any, user: any) {
    const where = {
      organizationId: user.organizationId,
      ...(query.nurseId && { nurseId: query.nurseId }),
      ...(query.restrictionTypeId && { restrictionTypeId: query.restrictionTypeId }),
      ...(query.search && {
        OR: [
          { nurse: { user: { firstName: { contains: query.search, mode: "insensitive" as const } } } },
          { nurse: { user: { lastName: { contains: query.search, mode: "insensitive" as const } } } },
          { restrictionType: { name: { contains: query.search, mode: "insensitive" as const } } },
        ],
      }),
    };

    const include = {
      nurse: true,
      restrictionType: true,
    };

    const orderBy = { createdAt: "desc" as const };

    // Paginación opcional
    if (query.page || query.limit) {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(500, Math.max(1, Number(query.limit) || 25));
      const [data, total] = await Promise.all([
        this.prisma.nurseRestriction.findMany({
          where,
          include,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.nurseRestriction.count({ where }),
      ]);
      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    return this.prisma.nurseRestriction.findMany({
      where,
      include,
      orderBy,
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

  // LÓGICA PARA CREAR/ACTUALIZAR (Bulk Sync)
  async syncRestriction(payload) {
    const { nurseIds, restrictionTypeId, startDate, endDate, isTemporary, isActive, notes } = payload;

    // 1. Eliminar las asignaciones previas de este TIPO específico
    // (Opcional: Si quieres que el "Editar" reemplace la lista de enfermeras seleccionadas)
    await this.prisma.nurseRestriction.deleteMany({
      where: { restrictionTypeId: restrictionTypeId }
    });

    // 2. Crear las nuevas asignaciones en lote para todas las enfermeras seleccionadas
    const bulkData = nurseIds.map(nurseId => ({
      nurseId,
      organizationId: payload.organizationId, // Asegúrate de tener este dato
      restrictionTypeId,
      startDate,
      endDate,
      isTemporary,
      isActive,
      notes
    }));

    await this.prisma.nurseRestriction.createMany({
      data: bulkData
    });

    return { message: "Asignaciones actualizadas en lote correctamente" };
  }
}
