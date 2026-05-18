import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service"; // Ajusta la ruta según tu arquitectura
import { CreateOrganizationDto } from "../dto/create-organization.dto"; // Ajusta tus rutas de DTOs
import { UpdateOrganizationDto } from "../dto/update-organization.dto";

@Injectable()
export class OrganizationsService {
  // Inyectamos el cliente de Prisma (que en Prisma 7 usa el PgAdapter internamente)
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva organización y su configuración obligatoria en una sola transacción.
   */
  async create(createOrganizationDto: CreateOrganizationDto) {
    // 1. Validar si el código de organización ya existe para evitar colisiones
    const existingOrg = await this.prisma.organization.findFirst({
      where: { code: createOrganizationDto.code },
    });

    if (existingOrg) {
      throw new ConflictException(
        `The Organization with the code '${createOrganizationDto.code}' already exists.`,
      );
    }

    // 2. Ejecutar la creación en una transacción ($transaction) por seguridad relacional
    return this.prisma.$transaction(async (tx) => {
      // Crear la organización principal
      const organization = await tx.organization.create({
        data: {
          name: createOrganizationDto.name,
          code: createOrganizationDto.code,
          timezone: createOrganizationDto.timezone || "America/Santo_Domingo",
          country: createOrganizationDto.country,
          status: createOrganizationDto.status || "A",
        },
      });

      // 🛠️ MODIFICADO: Ahora llena TODOS los datos por defecto unificados (Settings + Límites)
      await tx.organizationSetting.create({
        data: {
          organizationId: organization.id,

          // 🔹 Configuración Operativa (Booleanos)
          birthday_free_day_enabled: true,
          require_shift_approval: true,
          auto_balance_nigths: false,
          allow_cross_departament: false,
          allor_overtime: true, // Nota: Mantengo tu typo 'allor_overtime' tal como está en el schema.prisma

          // 🔹 Configuración de Límites de Horas Laborales (Antes en hour_limits) [cite: 37]
          max_monthly_hours: 160, // Estándar de 40h semanales al mes
          max_weekly_hours: 40, // Límite legal por semana estándar
          overtime_limit: 20, // Máximo de horas extra mensuales permitidas

          // 🔹 Configuración de Límites de Turnos Nocturnos (Antes en night_shift_limits) [cite: 38]
          max_nights: 10, // Máximo de noches permitidas por mes a un enfermero
          max_consecutive_nights: 3, // Evita el riesgo de fatiga extrema (no más de 3 noches seguidas)
        },
      });

      // Retornamos la organización creada incluyendo su configuración global e inteligente inicializada
      return tx.organization.findUnique({
        where: { id: organization.id },
        include: { settings: true },
      });
    });
  }

  /**
   * Obtiene todas las organizaciones registradas con sus configuraciones.
   */
  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        settings: true,
        _count: {
          select: { branches: true, users: true }, // Te añade métricas útiles de conteo de sucursales y empleados
        },
      },
    });
  }

  /**
   * Busca una organización por su ID. Lanza 404 si no existe.
   */
  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        settings: true,
        branches: true, // Útil para los Supervisores/Admins que consuman este endpoint
      },
    });

    if (!organization) {
      throw new NotFoundException(
        `The organization with the ID: '${id}' not found.`,
      );
    }

    return organization;
  }

  /**
   * Actualiza los datos de la organización.
   */
  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    // Verificar primero si existe
    await this.findOne(id);

    // Si intentan actualizar el código, verificar que no choque con otro existente
    if (updateOrganizationDto.code) {
      const codeCheck = await this.prisma.organization.findFirst({
        where: {
          code: updateOrganizationDto.code,
          NOT: { id }, // Que no sea la misma que estamos editando
        },
      });

      if (codeCheck) {
        throw new ConflictException(
          `The code: '${updateOrganizationDto.code}' is already assigned to an organization.`,
        );
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
      include: { settings: true },
    });
  }

  /**
   * Elimina una organización de la base de datos.
   * Nota: Tu esquema tiene 'onDelete: Cascade' en cascada para settings y branches,
   * por lo que borrará todo lo asociado de forma limpia y automática.
   */
  async remove(id: string) {
    // Verificar si existe primero
    await this.findOne(id);

    await this.prisma.organization.delete({
      where: { id },
    });

    return {
      deleted: true,
      message: `The organization with the ID '${id}' and  all its dependecies was deleted successfully.`,
    };
  }
}
