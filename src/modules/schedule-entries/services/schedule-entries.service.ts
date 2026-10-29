import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { ActivityLogType, OperationalAlertyTypes, PriorityTypes, ScheduleEntryStatus } from "@prisma/client";
import { PrismaService } from "@infra/database/prisma.service";
import { ScheduleValidationService } from "@modules/schedules/services/schedule-validation.service";
import { SingleValidationResult } from "@modules/schedules/interfaces/single-validation-result.interface";


@Injectable()
export class ScheduleEntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: ScheduleValidationService
  ) { }

  async create(dto: any, user: any) {
    const { shiftTemplateId, shiftId, scheduleId, nurseId, assignedById, date, ...rest } = dto;
    const entryDate = date && !date.includes("T") ? date + "T00:00:00.000Z" : date;
    return this.prisma.scheduleEntry.create({
      data: {
        ...rest,
        date: entryDate,
        organization: { connect: { id: user.organizationId } },
        shiftTemplate: { connect: { id: shiftTemplateId } },
        shift: { connect: { id: shiftId } },
        schedule: { connect: { id: scheduleId } },
        assignedBy: { connect: { id: assignedById || user.id || user.sub } },
        ...(nurseId && nurseId !== "" ? { nurse: { connect: { id: nurseId } } } : {}),
      },
    });
  }

  /**
   * Normaliza los extremos del rango de fechas. Las fechas sin hora se
   * interpretan como días completos (00:00:00 del inicio y 23:59:59.999
   * del final) para que el filtro "hasta" incluya el día seleccionado.
   */
  private parseDateBoundary(value: string, endOfDay: boolean): Date | undefined {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;

    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
    const normalized = isDateOnly
      ? `${trimmed}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`
      : trimmed;

    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  /** Construye el where compartido entre findAll y stats. */
  private buildWhere(query: any, user: any): any {
    const startDate = query.startDate
      ? this.parseDateBoundary(query.startDate, false)
      : undefined;
    const endDate = query.endDate
      ? this.parseDateBoundary(query.endDate, true)
      : undefined;
    const dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };

    return {
      organizationId: user.organizationId,
      ...(query.scheduleId && { scheduleId: query.scheduleId }),
      ...(query.nurseId && { nurseId: query.nurseId }),
      ...(query.shiftId && { shiftId: query.shiftId }),
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      ...(query.departmentId && {
        schedule: { departmentId: query.departmentId },
      }),
      ...(query.branchId && {
        branchId: query.branchId,
      }),
      ...(query.status && {
        status: query.status as any,
      }),
      ...(query.search && {
        OR: [
          { notes: { contains: query.search, mode: "insensitive" as const } },
          { shift: { name: { contains: query.search, mode: "insensitive" as const } } },
          { nurse: { user: { OR: [
            { firstName: { contains: query.search, mode: "insensitive" as const } },
            { lastName: { contains: query.search, mode: "insensitive" as const } },
          ] } } },
        ],
      }),
    };
  }

  /**
   * Agregados de cobertura (totales por estado, emergencias y por plantilla)
   * para mantener los indicadores precisos cuando la lista va paginada.
   */
  async stats(query: any, user: any) {
    const where = this.buildWhere(query, user);

    const [byStatus, total, emergencies, totalsByTemplate, assignedByTemplate] = await Promise.all([
      this.prisma.scheduleEntry.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
      }),
      this.prisma.scheduleEntry.count({ where }),
      this.prisma.scheduleEntry.count({ where: { ...where, isEmergencyCoverage: true } }),
      this.prisma.scheduleEntry.groupBy({
        by: ["shiftTemplateId"],
        where,
        _count: { _all: true },
      }),
      this.prisma.scheduleEntry.groupBy({
        by: ["shiftTemplateId"],
        where: {
          AND: [
            where,
            { nurseId: { not: null } },
            {
              status: {
                in: [ScheduleEntryStatus.ASSIGNED, ScheduleEntryStatus.CONFIRMED],
              },
            },
          ],
        },
        _count: { _all: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const row of byStatus) statusCounts[row.status] = row._count._all;

    const assigned = (statusCounts["ASSIGNED"] ?? 0) + (statusCounts["CONFIRMED"] ?? 0);

    // Nombres de plantilla para la distribución por turno
    const templateIds = totalsByTemplate.map((r) => r.shiftTemplateId);
    const templates = templateIds.length
      ? await this.prisma.shiftTemplate.findMany({
          where: { id: { in: templateIds } },
          select: { id: true, name: true },
        })
      : [];
    const templateNames = new Map(templates.map((t) => [t.id, t.name]));

    /*
     * La distribución se agrupa por TIPO de turno (MORNING, AFTERNOON...),
     * no por ID de plantilla. Así, cuando no hay departamento seleccionado,
     * las plantillas equivalentes de varias sedes/departamentos se suman en
     * una sola tarjeta en lugar de repetir "MORNING" varias veces.
     */
    const byShiftMap = new Map<
      string,
      { id: string; name: string; total: number; assigned: number }
    >();

    for (const row of totalsByTemplate) {
      const name = templateNames.get(row.shiftTemplateId) || "SIN_TURNO";
      const current = byShiftMap.get(name) || {
        id: name,
        name,
        total: 0,
        assigned: 0,
      };
      current.total += row._count._all;
      byShiftMap.set(name, current);
    }

    for (const row of assignedByTemplate) {
      const name = templateNames.get(row.shiftTemplateId) || "SIN_TURNO";
      const current = byShiftMap.get(name);
      if (current) current.assigned += row._count._all;
    }

    const shiftOrder = [
      "MORNING",
      "AFTERNOON",
      "NIGHT",
      "MORNING_AFTERNOON",
      "MORNING_NIGHT",
      "NIGTH_AFTERNOON",
    ];

    const byShift = Array.from(byShiftMap.values()).sort((a, b) => {
      const aIndex = shiftOrder.indexOf(a.name);
      const bIndex = shiftOrder.indexOf(b.name);
      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? shiftOrder.length : aIndex) -
          (bIndex === -1 ? shiftOrder.length : bIndex);
      }
      return a.name.localeCompare(b.name);
    });

    return {
      total,
      assigned,
      vacant: statusCounts["OPEN"] ?? 0,
      pending: statusCounts["PENDING"] ?? 0,
      cancelled: statusCounts["CANCELLED"] ?? 0,
      emergencies,
      statusCounts,
      coverage: total > 0 ? Math.round((assigned / total) * 100) : 0,
      byShift,
    };
  }

  async findAll(query: any, user: any) {
    const where = this.buildWhere(query, user);

    const select = {
      id: true,
      scheduleId: true,
      shiftId: true,
      branchId: true,
      date: true,
      status: true,
      nurseId: true,
      notes: true,
      isEmergencyCoverage: true,
      branch: {
        select: { id: true, name: true },
      },
      nurse: {
        select: {
          id: true,
          departmentId: true, // 🌟 Añadido para facilitar validaciones de préstamo interdepartamental en el front
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      },
      shift: true,
      schedule: true,
      shiftTemplate: {
        select: {
          name: true,
          departmentId: true, // 🌟 Crítico: Expone el ID directo de la plantilla para el matching del modal
          startTime: true,
          endTime: true,
          department: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        }
      },
    };

    const orderBy = { date: "asc" as const };

    // Paginación opcional: sin page/limit se mantiene el array plano
    // (backward compatible con el calendario global y otros consumidores)
    if (query.page || query.limit) {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(500, Math.max(1, Number(query.limit) || 25));
      const [data, total] = await Promise.all([
        this.prisma.scheduleEntry.findMany({
          where,
          select,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.scheduleEntry.count({ where }),
      ]);
      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    return this.prisma.scheduleEntry.findMany({
      where,
      select,
      orderBy,
    });
  }

  async findOne(id: string, user: any) {
    const entry = await this.prisma.scheduleEntry.findFirst({
      where: {
        id,
        nurse: {
          organizationId: user.organizationId,
        },
      },
      include: {
        nurse: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true, // 💡 Agregado: Tu front lo usa para armar el "fullName"
              },
            },
          },
        },
        shift: true,
        // 🏛️ ESENCIAL PARA EL FRONTEND Y AUDITORÍA:
        // Incluimos la plantilla y el departamento para evitar mutaciones ciegas o errores de renderizado
        shiftTemplate: {
          include: {
            department: true,
            branch: true,
          },
        },
        branch: true,
      },
    });

    if (!entry) {
      throw new NotFoundException("Schedule entry not found");
    }

    return entry;
  }

  async update(id: string, dto: any, user: any) {

    // 1. Obtener el estado actual del turno ANTES de ser modificado (Para auditoría)
    // 🐛 FIX: Buscar por `id` (el ID del ScheduleEntry), no por `shiftId`
    const currentEntry = await this.prisma.scheduleEntry.findFirst({
      where: { id }
    })

    if (!currentEntry) {
      throw new NotFoundException("Schedule entry not found");
    }

    // 🟢 Inicializamos el resultado de validación vacío por defecto
    let validationResult: SingleValidationResult

    // 2. Ejecutar la simulación del motor de reglas SOLO si se está asignando a alguien
    // Si dto.nurseId viene vacío o nulo, significa que se está dejando VACANTE.
    if (dto.nurseId && dto.nurseId !== "") {
      validationResult = await this.validationService.validateSingleAssignment({
        nurseId: dto.nurseId, // Validamos el NUEVO enfermero que se quiere meter, no el anterior
        shiftId: dto.shiftId || currentEntry.shiftId,
        date: currentEntry.date.toString(),
        entryId: id
      });

      // Si el motor de reglas detecta un bloqueo duro (CRITICAL/HIGH), detenemos la transacción inmediatamente
      if (validationResult?.errors?.length > 0) {
        throw new BadRequestException({
          message: `Action denied by clinical rules: ${validationResult.errors.join(', ')}`,
          error: 'Hard Block Violation'
        });
      }
    }

    const calculatedStatus = (dto.nurseId === "" || !dto.nurseId) ? ScheduleEntryStatus.OPEN : ScheduleEntryStatus.ASSIGNED;

    // 🟢 TRANSFORMAR DATA PARA PRISMA: Si nurseId es "", lo convertimos a null para desasignar en la BD
    const dataToUpdate = {
      shiftId: dto.shiftId,
      nurseId: dto.nurseId === "" ? null : dto.nurseId,
      status: calculatedStatus
    };

    // 3. Iniciar Transacción Robusta en la Base de Datos
    return this.prisma.$transaction(async (tx) => {

      // A. Realizar la actualización física del ScheduleEntry
      const updatedEntry = await tx.scheduleEntry.update({
        where: { id },
        data: dataToUpdate,
        include: { nurse: { include: { user: true } }, shift: true }
      });

      // B. TABLA 1: Insertar en ActivityLog (Auditoría del Sistema)
      await tx.activityLog.create({
        data: {
          userId: user.id, // El administrador/supervisor que logueó la petición
          action: ActivityLogType.SHIFT_MODIFIED, // Ajusta según tus enums de ActivityLogType
          details: {
            entryId: id,
            reason: dto.nurseId === "" ? 'Shift released / Personnel removed.' : 'Manual modification from the calendar module.',
            cambio: {
              enfermeraAnterior: currentEntry.nurseId,
              enfermeraNueva: updatedEntry.nurseId,
              statusAnterior: currentEntry.status, // 🌟 Registramos el cambio de estado en la auditoría
              statusNuevo: updatedEntry.status,     // 🌟 para saber si pasó de ASSIGNED a OPEN
              turnoAnterior: currentEntry.shiftId,
              turnoNuevo: updatedEntry.shiftId,
            }
          }
        }
      });

      // C. TABLA 2: Documentar Alertas Operacionales si hubo Warnings (MEDIUM / LOW)
      // Si el supervisor ignoró advertencias y le dio a guardar, las dejamos registradas en la BD
      const warnings = validationResult?.warnings || [];
      if (warnings.length > 0) {
        // Asumiendo que tienes una tabla/modelo de Alertas Operacionales en tu negocio:
        // (Si no tienes el modelo creado, puedes guardar estos warnings dentro del JSON de detalles del ActivityLog anterior)
        await tx.operationalAlert?.create({
          data: {
            departmentId: dto.departmentId,
            severity: PriorityTypes.HIGH,
            alertType: OperationalAlertyTypes.RULE_VIOLATION,
            message: `Supervisor ignored restrictions: ${warnings.join(' | ')}`,
          }
        }).catch(() => { /* Evitar caídas si el modelo operacional aún no migra */ });
      }

      // D. TABLA 3: Si hubo una regla menor 'INFO', hacemos el registro silencioso en logs o BD
      // Aquí puedes mapear si deseas un tracking especial de preferencias menores rotas.

      return updatedEntry;
    });
  }


  async remove(id: string, user: any) {
    console.log(user)

    const isSuperAdmin = user.role === "SUPER";

    // 1. Verificación Multi-tenant de Seguridad
    // Confirmamos que el turno existe y pertenece a la organización del usuario
    const currentEntry = await this.prisma.scheduleEntry.findFirst({
      where: isSuperAdmin ? {
        id,
      } : { organizationId: user.organizationId, id },
      include: {
        nurse: {
          select: { user: { select: { firstName: true, lastName: true } } }
        },
        shiftTemplate: {
          select: { name: true, department: { select: { name: true } } }
        }
      }
    });

    if (!currentEntry) {
      throw new NotFoundException(`La asignación con ID ${id} no fue encontrada en su organización.`);
    }

    // 2. Ejecutar la eliminación controlada dentro de una Transacción
    return this.prisma.$transaction(async (tx) => {

      // B. Eliminar físicamente el registro (El ScheduleEntry)
      const deletedEntry = await tx.scheduleEntry.delete({
        where: { id },
      });

      // C. Registrar en la bitácora de auditoría (ActivityLog)
      await tx.activityLog.create({
        data: {
          userId: user.sub, // El administrador que presionó el botón "Borrar"
          action: ActivityLogType.SHIFT_DELETED, // El tipo de acción en tu Enum
          details: {
            entryId: id,
            reason: 'Shift removed/unassigned manually from the calendar interface.',
            datosBorrados: {
              fecha: currentEntry.date,
              enfermeraId: currentEntry.nurseId,
              turno: currentEntry.shiftTemplate?.name,
              departamento: (currentEntry.shiftTemplate as any)?.department?.name
            }
          }
        }
      });

      return deletedEntry;
    });
  }

  // 📄 Dentro de tu schedule-entries.service.ts (NestJS Backend)

  async createBulk(dto: any, user: any) {
    const { date, entries } = dto;

    if (!entries || entries.length === 0) {
      throw new BadRequestException("No se enviaron asignaciones para registrar.");
    }

    // 1. Preparar arreglos para acumular las filas procesadas y alertas operacionales
    const finalEntriesToCreate: any = [];
    const globalWarningsLog: any = [];

    // 2. Procesar y escanear cada fila de forma individual antes de tocar la base de datos
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // Si no se seleccionó un turno (shiftId), ignoramos la fila corrupta
      if (!entry.shiftId) continue;

      // Determinar estatus inicial en base a si viene o no personal elegido
      const isVacant = !entry.nurseId || entry.nurseId === "";
      const currentStatus = isVacant ? 'OPEN' : 'ASSIGNED';

      // Ejecutar simulación del motor de reglas SOLO si hay un enfermero asignado
      if (!isVacant) {
        const validationResult = await this.validationService.validateSingleAssignment({
          nurseId: entry.nurseId,
          shiftId: entry.shiftId,
          date: date, // Fecha del día seleccionado en el calendario
        });

        // Bloqueo duro inmediato si se detecta una violación crítica (ej: doble turno o fatiga extrema)
        if (validationResult?.errors?.length > 0) {
          throw new BadRequestException({
            message: `Row ${i + 1} denied by clinical rules: ${validationResult.errors.join(', ')}`,
            error: 'Hard Block Bulk Violation'
          });
        }

        // Acumulamos las advertencias leves si el supervisor decidió forzarlas
        if (validationResult?.warnings?.length > 0) {
          globalWarningsLog.push({
            shiftId: entry.shiftId,
            messages: validationResult.warnings
          });
        }
      }

      // Estructuramos el objeto limpio mapeado para Prisma
      finalEntriesToCreate.push({
        date: new Date(date),
        shiftId: entry.shiftId,
        nurseId: isVacant ? null : entry.nurseId,
        status: currentStatus,
        notes: entry.notes || null,
        shiftTemplateId: entry.shiftTemplateId, // 🐛 FIX: usar el template de CADA fila, no solo el primero
        scheduleId: dto.scheduleId,
        assignedById: user.id,
        organizationId: user.organizationId
      });
    }

    // 3. Abrir Transacción Robusta en la Base de Datos
    return this.prisma.$transaction(async (tx) => {

      // A. Inserción masiva física (Usa createMany si tu base de datos lo soporta, o mapea un Promise.all)
      // Usamos un bucle de inserción controlada para poder recuperar los registros con sus relaciones
      const createdEntries: any[] = [];
      for (const data of finalEntriesToCreate) {
        const newRecord = await tx.scheduleEntry.create({
          data,
          include: { nurse: { include: { user: true } }, shift: true }
        });
        createdEntries.push(newRecord);
      }

      // B. Guardar historial masivo en la tabla de Auditoría (ActivityLog)
      await tx.activityLog.create({
        data: {
          userId: user.id, // El administrador que aprobó el bloque
          action: ActivityLogType.SHIFT_APPROVED, // Usamos tu enum del schema.prisma
          details: {
            message: `Creación masiva exitosa de ${createdEntries.length} turnos en el calendario.`,
            fechaAsignada: date,
            registrosIds: createdEntries.map(e => e.id)
          }
        }
      });

      // C. Persistir Alertas Operacionales si se ignoraron Soft-Warnings
      if (globalWarningsLog.length > 0) {
        for (const alert of globalWarningsLog) {
          // Buscamos a qué departamento pertenece el turno para direccionar la alerta correctamente
          const targetShift = await tx.shift.findUnique({ where: { id: alert.shiftId } });

          await tx.operationalAlert?.create({
            data: {
              departmentId: targetShift?.departmentId || user.departmentId,
              severity: PriorityTypes.HIGH, // O MEDIUM según tus enums
              alertType: OperationalAlertyTypes.RULE_VIOLATION,
              message: `Restricciones ignoradas en asignación masiva: ${alert.messages.join(' | ')}`,
            }
          }).catch(() => { /* Previene interrupciones si no se ha migrado el modelo */ });
        }
      }

      // Retornamos el listado completo para que TanStack Query actualice el Front de inmediato
      return createdEntries;
    });
  }
}
