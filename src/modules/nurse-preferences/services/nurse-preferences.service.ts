import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class NursePreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, user: any) {
    return this.prisma.nursePreferences.create({
      data: {
        ...dto,
        organizationId: user.organizationId,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.nursePreferences.findMany({
      where: {
        organizationId: user.organizationId,
        ...(query.userId && {
          userId: query.userId,
        }),
      },
      include: {
        nurse: true,
      },
    });
  }

  async findOne(id: string, user: any) {
    const preference = await this.prisma.nursePreferences.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    });

    if (!preference) {
      throw new NotFoundException("Preference not found");
    }

    return preference;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.nursePreferences.update({
      where: {
        id,
      },
      data: dto,
    });
  }
}
