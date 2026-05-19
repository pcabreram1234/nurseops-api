import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class NurseAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, user: any) {
    /*
    |--------------------------------------------------------------------------
    | VALIDATE UNIQUE DATE
    |--------------------------------------------------------------------------
    */

    const existing = await this.prisma.nurseAvailability.findFirst({
      where: {
        nurseId: dto.nurseId,
        date: new Date(dto.date),
      },
    });

    if (existing) {
      throw new ConflictException("Availability already exists for this date");
    }

    return this.prisma.nurseAvailability.create({
      data: {
        ...dto,
        organizationId: user.organizationId,
      },
      include: {
        nurse: true,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.nurseAvailability.findMany({
      where: {
        organizationId: user.organizationId,
        ...(query.nurseId && {
          nurseId: query.nurseId,
        }),
        ...(query.status && {
          status: query.status,
        }),
        ...(query.startDate &&
          query.endDate && {
            date: {
              gte: new Date(query.startDate),
              lte: new Date(query.endDate),
            },
          }),
      },
      include: {
        nurse: true,
      },
      orderBy: {
        date: "asc",
      },
    });
  }

  async findOne(id: string, user: any) {
    const availability = await this.prisma.nurseAvailability.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        nurse: true,
      },
    });

    if (!availability) {
      throw new NotFoundException("Availability not found");
    }

    return availability;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.nurseAvailability.update({
      where: {
        id,
      },
      data: dto,
      include: {
        nurse: true,
      },
    });
  }
}
