import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class SpecialitiesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: any) {
    return this.prisma.speciality.create({
      data: dto,
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.speciality.findMany({
      where: {
        organizationId,
      },

      include: {
        nurses: true,

        departmentSpecialities: true,
      },
    });
  }

  async findOne(id: string, user: any) {
    const isSuperAdmin = user.role === "SUPER"
    const speciality = await this.prisma.speciality.findFirst({
      where: isSuperAdmin ? { id } : { id: id, organization: user.organizationId },
      include: {
        nurses: true,

        departmentSpecialities: true,
      },
    });

    if (!speciality) {
      throw new NotFoundException("Speciality not found");
    }

    return speciality;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.speciality.update({
      where: { id },

      data: dto,
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);

    return this.prisma.speciality.delete({
      where: { id },
    });
  }
}
