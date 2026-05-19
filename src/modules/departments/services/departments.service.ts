import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  async create(dto: any) {
    return this.prisma.department.create({
      data: dto,
      include: {
        branch: true,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ALL
  |--------------------------------------------------------------------------
  */

  async findAll(query: any, user: any) {
    return this.prisma.department.findMany({
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
        ...(query.branchId && {
          branchId: query.branchId,
        }),
        ...(query.type && {
          type: query.type,
        }),
        ...(query.criticalLevel && {
          criticalLevel: query.criticalLevel,
        }),
        ...(query.isEmergencyDepartment !== undefined && {
          isEmergencyDepartment: query.isEmergencyDepartment,
        }),
      },
      include: {
        branch: true,
        nurses: true,
        shifts: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ONE
  |--------------------------------------------------------------------------
  */

  async findOne(id: string, user: any) {
    const department = await this.prisma.department.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        branch: true,
        nurses: true,
        shifts: true,
        schedules: true,
        departmentConfigurations: true,
        departmentSpecialities: true,
      },
    });

    if (!department) {
      throw new NotFoundException("Department not found");
    }

    return department;
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.department.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  async remove(id: string, user: any) {
    await this.findOne(id, user);
    return this.prisma.department.delete({
      where: {
        id,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | ASSIGN NURSES
  |--------------------------------------------------------------------------
  */

  async assignNurses(departmentId: string, dto: any, user: any) {
    await this.findOne(departmentId, user);
    return this.prisma.nurse.updateMany({
      where: {
        id: {
          in: dto.nurseIds,
        },
        organizationId: user.organizationId,
      },
      data: {
        departmentId,
      },
    });
  }
}
