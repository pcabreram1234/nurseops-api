import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class DepartmentConfigurationsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: any) {
    return this.prisma.departmentConfiguration.create({
      data: dto,
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.departmentConfiguration.findMany({
      where: {
        organizationId,
      },

      include: {
        department: true,
      },
    });
  }
  async findOne(id: string, user: any,) {
    /*
    |--------------------------------------------------------------------------
    | SUPER ADMIN
    |--------------------------------------------------------------------------
    | Puede acceder a cualquier configuración
    */

    if (user.role === "SUPER") {
      const configuration =
        await this.prisma.departmentConfiguration.findUnique({
          where: { id },

          include: {
            department: true,
          },
        });

      if (!configuration) {
        throw new NotFoundException(
          "Department configuration not found",
        );
      }

      return configuration;
    }

    /*
    |--------------------------------------------------------------------------
    | ORGANIZATION ISOLATION
    |--------------------------------------------------------------------------
    */

    const configuration =
      await this.prisma.departmentConfiguration.findFirst({
        where: {
          id,
          department: {
            organizationId:
              user.organizationId,
          },
        },

        include: {
          department: true,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (!configuration) {
      throw new NotFoundException(
        "Department configuration not found",
      );
    }

    return configuration;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);

    return this.prisma.departmentConfiguration.update({
      where: { id },

      data: dto,
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);

    return this.prisma.departmentConfiguration.delete({
      where: { id },
    });
  }
}
