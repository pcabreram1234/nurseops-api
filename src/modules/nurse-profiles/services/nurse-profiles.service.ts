import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class NurseProfilesService {
  constructor(private readonly prisma: PrismaService) { }

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
    const userRole = user.role?.toUpperCase();
    let roleWhereCondition = {};

    if (userRole === "SUPER") {
      // Si es SUPER: Ve los perfiles de todas las organizaciones (sin filtro de organizationId)
      roleWhereCondition = {};
    } else if (userRole === "SYSTEM" || userRole === "SYSTEM_ADMIN" || userRole === "HR_MANAGER") {
      // Si es SYSTEM / SYSTEM_ADMIN: Ve todos los perfiles de su propia organización
      roleWhereCondition = {
        organizationId: user.organizationId,
      };
    } else {
      // Para otros roles (ej. Enfermeras regulares): Su organización 
      // (y opcionalmente podrías restringir al propio nurseId si el usuario es una enfermera común)
      roleWhereCondition = {
        organizationId: user.organizationId,
        nurseId: user.sub
        // Si un rol NURSE solo debe ver su propio perfil cuando no pasa filtros:
        // ...(userRole === "NURSE" && { nurseId: user.sub }) 
      };
    }

    return this.prisma.nurseProfile.findMany({
      where: {
        ...roleWhereCondition,
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
    let roleWhereCondition = {};
    const userRole = user.role?.toUpperCase();



    if (userRole === "SUPER") {
      // Si es SUPER: Ve los perfiles de todas las organizaciones (sin filtro de organizationId)
      roleWhereCondition = { id: id };
    } else if (userRole === "SYSTEM" || userRole === "SYSTEM_ADMIN" || userRole === "HR_MANAGER") {
      // Si es SYSTEM / SYSTEM_ADMIN: Ve todos los perfiles de su propia organización
      roleWhereCondition = {
        organizationId: user.organizationId,
        nurseId: id
      };
    } else {
      // Para otros roles (ej. Enfermeras regulares): Su organización 
      // (y opcionalmente podrías restringir al propio nurseId si el usuario es una enfermera común)
      roleWhereCondition = {
        organizationId: user.organizationId,
        nurseId: user.sub
        // Si un rol NURSE solo debe ver su propio perfil cuando no pasa filtros:
        // ...(userRole === "NURSE" && { nurseId: user.sub }) 
      };
    }

    const profile = await this.prisma.nurseProfile.findFirst({
      where: {
        ...roleWhereCondition,
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
      where:
      {
        id: id
      },
      data: dto,
      include: {
        nurse: true,
      },
    });
  }
}
