import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class NurseProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, user: any) {
    /*
    |--------------------------------------------------------------------------
    | VALIDATE UNIQUE PROFILE
    |--------------------------------------------------------------------------
    */

    const existingProfile = await this.prisma.nurseProfile.findFirst({
      where: {
        nurseId: dto.nurseId,
      },
    });

    if (existingProfile) {
      throw new ConflictException("Nurse profile already exists");
    }

    return this.prisma.nurseProfile.create({
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
    return this.prisma.nurseProfile.findMany({
      where: {
        organizationId: user.organizationId,
        ...(query.nurseId && {
          nurseId: query.nurseId,
        }),
        ...(query.educationLevel && {
          educationLevel: query.educationLevel,
        }),
      },
      include: {
        nurse: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string, user: any) {
    const profile = await this.prisma.nurseProfile.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        nurse: true,
      },
    });

    if (!profile) {
      throw new NotFoundException("Nurse profile not found");
    }
    return profile;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.nurseProfile.update({
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
