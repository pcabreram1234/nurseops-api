import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

import { VacationStatus } from "@prisma/client";

@Injectable()
export class VacationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, user: any) {
    /*
    |--------------------------------------------------------------------------
    | VALIDATE DATES
    |--------------------------------------------------------------------------
    */

    if (new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException("End date cannot be before start date");
    }

    return this.prisma.vacation.create({
      data: {
        ...dto,
        organizationId: user.organizationId,
        status: dto.status || VacationStatus.DRAFT,
      },
      include: {
        nurse: true,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.vacation.findMany({
      where: {
        organizationId: user.organizationId,

        ...(query.nurseId && {
          nurseId: query.nurseId,
        }),

        ...(query.status && {
          status: query.status,
        }),
        ...(query.startDate && {
          startDate: query.startDate,
        }),
        ...(query.endDate && {
          endDate: query.endDate,
        }),
      },
      include: {
        nurse: true,
        approvedBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string, user: any) {
    const vacation = await this.prisma.vacation.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        nurse: true,
        approvedBy: true,
      },
    });

    if (!vacation) {
      throw new NotFoundException("Vacation not found");
    }

    return vacation;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.vacation.update({
      where: {
        id,
      },

      data: dto,
    });
  }

  async approve(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.vacation.update({
      where: {
        id,
      },

      data: {
        status: dto.status,

        approvedById: user.sub,

        approvedAt: new Date(),

        rejectionReason: dto.rejectionReason,
      },
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);
    return this.prisma.vacation.delete({
      where: {
        id,
      },
    });
  }
}
