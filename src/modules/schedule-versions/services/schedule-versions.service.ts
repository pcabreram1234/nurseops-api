import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";
import { CreateScheduleVersionDto } from "../dto/create-schedule-version.dto";

export interface UserOrgContext {
  organizationId?: string;
  role?: string;
  id?: string;
}

@Injectable()
export class ScheduleVersionsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(userOrg?: UserOrgContext) {
    const where: any = {};

    // Aislamiento: solo SUPER ve todas las versiones; el resto filtra por schedule.organizationId
    if (userOrg && userOrg.role !== 'SUPER') {
      if (userOrg.organizationId) {
        where.schedule = { organizationId: userOrg.organizationId };
      }
    }

    return where;
  }

  async create(dto: CreateScheduleVersionDto, userOrg: UserOrgContext) {
    // Verificar que el schedule existe y pertenece a la org (si no SUPER)
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: dto.scheduleId },
      select: { organizationId: true },
    });

    if (!schedule) {
      throw new NotFoundException("Schedule no encontrado");
    }

    if (userOrg.role !== 'SUPER' && schedule.organizationId !== userOrg.organizationId) {
      throw new NotFoundException("Schedule no encontrado en su organización");
    }

    const latestVersion = await this.prisma.scheduleVersion.findFirst({
      where: {
        scheduleId: dto.scheduleId,
      },
      orderBy: {
        version: "desc",
      },
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    return this.prisma.scheduleVersion.create({
      data: {
        ...dto,
        version: nextVersion,
        createdById: userOrg.id,
      },
    });
  }

  async findAll(scheduleId: string, userOrg?: UserOrgContext) {
    const where = this.buildWhere(userOrg);
    where.scheduleId = scheduleId;

    return this.prisma.scheduleVersion.findMany({
      where,
      orderBy: {
        version: "desc",
      },
    });
  }

  async findOne(id: string, userOrg?: UserOrgContext) {
    const where = this.buildWhere(userOrg);
    where.id = id;

    const version = await this.prisma.scheduleVersion.findFirst({
      where,
      include: { schedule: { select: { organizationId: true } } },
    });

    if (!version) {
      throw new NotFoundException("Schedule version not found");
    }

    return version;
  }
}
