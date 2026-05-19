import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.branch.create({
      data: dto,
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.branch.findMany({
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
              address: {
                contains: query.search,
                mode: "insensitive",
              },
            },
          ],
        }),
        ...(query.city && {
          city: query.city,
        }),
        ...(query.country && {
          country: query.country,
        }),
      },
      include: {
        departments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string, user: any) {
    const branch = await this.prisma.branch.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        departments: true,
      },
    });

    if (!branch) {
      throw new NotFoundException("Branch not found");
    }

    return branch;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.branch.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);
    return this.prisma.branch.delete({
      where: {
        id,
      },
    });
  }
}
