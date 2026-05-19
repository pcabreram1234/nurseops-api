import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class OrganizationSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    const existing = await this.prisma.organizationSetting.findUnique({
      where: {
        organizationId: dto.organizationId,
      },
    });

    if (existing) {
      throw new ConflictException("Organization settings already exist");
    }

    return this.prisma.organizationSetting.create({
      data: dto,
    });
  }

  async findOne(organizationId: string) {
    const settings = await this.prisma.organizationSetting.findUnique({
      where: {
        organizationId,
      },
    });

    if (!settings) {
      throw new NotFoundException("Organization settings not found");
    }

    return settings;
  }

  async update(organizationId: string, dto: any) {
    await this.findOne(organizationId);

    return this.prisma.organizationSetting.update({
      where: {
        organizationId,
      },

      data: dto,
    });
  }
}
