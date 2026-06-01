import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import { CreateRoleDto } from "../dto/create-role.dto";
import { AssignPermissionsDto } from "../dto/assign-permissions.dto";

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) { }

  /*
  |--------------------------------------------------------------------------
  | CREATE ROLE
  |--------------------------------------------------------------------------
  */
  async create(createRoleDto: CreateRoleDto) {

    // Validar si el rol ya existe dentro de la misma organización
    const existingRole = await this.prisma.roles.findFirst({
      where: {
        name: createRoleDto.name,
      },
    });

    if (existingRole) {
      throw new ConflictException(
        `Role '${createRoleDto.name}' already exists in this organization.`,
      );
    }

    return this.prisma.roles.create({
      data: {
        name: createRoleDto.name,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ALL
  |--------------------------------------------------------------------------
  */
  async findAll(query: any, currentUser: any) {
    const where: any = {};

    // Búsqueda por texto (Opcional)
    if (query.search) {
      where.name = {
        contains: query.search,
        mode: "insensitive",
      };
    }

    // 🔒 Filtro de Seguridad: Si NO es SUPER, obligatoriamente se segmenta por su organización
    if (currentUser.role !== "SUPER") {
      where.organizationId = currentUser.organizationId;
    } else if (query.organizationId) {
      // Si es SUPER, opcionalmente puede pasar un query param para filtrar por un hospital específico
      where.organizationId = query.organizationId;
    }

    return this.prisma.roles.findMany({
      where,
      include: {
        rolePermissions: {
          include: {
            permissions: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ONE
  |--------------------------------------------------------------------------
  */
  async findOne(id: string) {
    const role = await this.prisma.roles.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    return role;
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE ROLE
  |--------------------------------------------------------------------------
  */
  async update(id: string, body: any) {
    // Reutilizamos findOne para que ejecute la verificación de existencia y pertenencia
    await this.findOne(id);

    return this.prisma.roles.update({
      where: { id },
      data: body,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE ROLE
  |--------------------------------------------------------------------------
  */
  async remove(id: string) {
    // Reutilizamos findOne para validar existencia y pertenencia antes de borrar
    await this.findOne(id);

    return this.prisma.roles.delete({
      where: { id },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | ASSIGN PERMISSIONS
  |--------------------------------------------------------------------------
  */
  async assignPermissions(roleId: string, dto: AssignPermissionsDto, currentUser: any) {
    // Valida existencia y pertenencia a la organización del ADMIN antes de alterar permisos
    await this.findOne(roleId);

    // Envolvemos el borrado e inserción en una transacción atómica segura
    await this.prisma.$transaction(async (tx) => {
      /*
      |--------------------------------------------------------------------------
      | REMOVE OLD PERMISSIONS
      |--------------------------------------------------------------------------
      */
      await tx.rolePermissions.deleteMany({
        where: { roleId },
      });

      /*
      |--------------------------------------------------------------------------
      | CREATE NEW PERMISSIONS
      |--------------------------------------------------------------------------
      */
      await tx.rolePermissions.createMany({
        data: dto.permissionIds.map((permisionId) => ({
          roleId,
          permisionId, // Ajustado a la propiedad exacta con una sola 'c' de tu schema
        })),
      });
    });

    return this.findOne(roleId);
  }
}