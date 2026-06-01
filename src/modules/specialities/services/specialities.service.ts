import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import { CreateSpecialityDto } from "../dto/create-speciality.dto";
import { UpdateSpecialityDto } from "../dto/update-speciality.dto";

@Injectable()
export class SpecialitiesService {
  constructor(private readonly prisma: PrismaService) { }

  // 🌟 ADAPTADO: Ahora procesa la inserción de relaciones desde el inicio
  async create(dto: CreateSpecialityDto) {
    const { departmentIds, ...specialityData } = dto;

    return this.prisma.speciality.create({
      data: {
        ...specialityData,
        departmentSpecialities: {
          create: departmentIds?.map((deptId) => ({
            departmentId: deptId,
            required: true,
            priority: 1,
            minimum_staff: 1,
          })) || [],
        },
      },
      include: {
        departmentSpecialities: {
          include: { department: true }
        }
      }
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.speciality.findMany({
      where: { organizationId },
      include: {
        nurses: true,
        departmentSpecialities: {
          include: { department: true }
        },
      },
    });
  }

  async findOne(id: string, user: any) {
    const isSuperAdmin = user.role === "SUPER";
    
    const speciality = await this.prisma.speciality.findFirst({
      // 🌟 CORRECCIÓN: Se cambió 'organization' por 'organizationId' para cumplir con el modelo
      where: isSuperAdmin ? { id } : { id, organizationId: user.organizationId },
      include: {
        nurses: true,
        departmentSpecialities: {
          include: { department: true }
        },
      },
    });

    if (!speciality) {
      throw new NotFoundException("Speciality not found");
    }

    return speciality;
  }

  // 🌟 ADAPTADO Y CORREGIDO: Manejo seguro de transacciones y limpieza relacional
  async update(id: string, dto: UpdateSpecialityDto, user: any) {
    // Verificamos primero que exista y el usuario tenga acceso (por organización)
    await this.findOne(id, user);

    const { name, code, description, organizationId, isActive, departmentIds } = dto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Si se envió el arreglo de departamentos, limpiamos las asociaciones anteriores de ESTA especialidad
      if (departmentIds) {
        await tx.departmentSpeciality.deleteMany({
          where: { specialityId: id } // 🌟 CORRECCIÓN: Filtrar por el ID de la especialidad actual
        });
      }

      // 2. Actualizamos los campos de la especialidad y re-inyectamos los departamentos seleccionados
      return await tx.speciality.update({
        where: { id },
        data: {
          name,
          code,
          description,
          organizationId,
          isActive,
          ...(departmentIds && {
            departmentSpecialities: {
              create: departmentIds.map((deptId: string) => ({
                departmentId: deptId,
                required: true,
                priority: 1,
                minimum_staff: 1
              }))
            }
          })
        },
        include: {
          departmentSpecialities: {
            include: { department: true }
          }
        }
      });
    });
  }

  async remove(id: string, user: any) {
    // Valida propiedad antes de borrar
    await this.findOne(id, user);

    return this.prisma.speciality.delete({
      where: { id },
    });
  }
}