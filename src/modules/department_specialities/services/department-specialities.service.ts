import { BadRequestException, Injectable } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class DepartmentSpecialitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async assign(dto: any) {
    const exists = await this.prisma.departmentSpeciality.findUnique({
      where: {
        departmentId_specialityId: {
          departmentId: dto.departmentId,

          specialityId: dto.specialityId,
        },
      },
    });

    if (exists) {
      throw new BadRequestException("Speciality already assigned");
    }

    return this.prisma.departmentSpeciality.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.departmentSpeciality.findMany({
      include: {
        department: true,

        speciality: true,
      },
    });
  }

  async remove(
    departmentId: string,

    specialityId: string,
  ) {
    return this.prisma.departmentSpeciality.delete({
      where: {
        departmentId_specialityId: {
          departmentId,

          specialityId,
        },
      },
    });
  }
}
