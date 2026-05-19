import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class EmergencyCandidatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, user: any) {
    return this.prisma.emergencyCandidates.create({
      data: {
        ...dto,

        organizationId: user.organizationId,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.emergencyCandidates.findMany({
      where: {
        organizationId: user.organizationId,

        ...(query.coverageRequestId && {
          coverageRequestId: query.coverageRequestId,
        }),
      },

      include: {
        nurse: true,

        coverageRequest: true,
      },

      orderBy: {
        score: "desc",
      },
    });
  }

  async findOne(id: string, user: any) {
    const candidate = await this.prisma.emergencyCandidates.findFirst({
      where: {
        id,

        organizationId: user.organizationId,
      },
    });

    if (!candidate) {
      throw new NotFoundException("Emergency candidate not found");
    }

    return candidate;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);

    return this.prisma.emergencyCandidates.update({
      where: {
        id,
      },

      data: dto,
    });
  }
}
