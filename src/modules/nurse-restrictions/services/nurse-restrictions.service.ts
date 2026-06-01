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
