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
    return this.prisma.scheduleEntry.create({
      data: {
        ...dto,
        organizationId: user.organizationId,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.scheduleEntry.findMany({
      where: {
        organizationId: user.organizationId,
        ...(query.scheduleId && {
          scheduleId: query.scheduleId,
        }),
        ...(query.nurseId && {
          nurseId: query.nurseId,
        }),
        ...(query.shiftId && {
          shiftId: query.shiftId,
        }),
        ...(query.startDate &&
          query.endDate && {
          date: {
            gte: new Date(query.startDate),
            lte: new Date(query.endDate),
          },
        }),
        // 🌟 CORRECCIÓN DEL FILTRO: Navegación profunda en la relación
        ...(query.departmentId && {
          shiftTemplate: {
            departmentId: query.departmentId // O department: { id: query.departmentId } según tu esquema
          }
        })
      },
      select: {
        id: true,
        scheduleId: true,
        shiftId: true,
        date: true,
        status: true,
        nurseId: true,
        notes: true,
        isEmergencyCoverage: true,
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
      },
      orderBy: {
        date: "asc",
      },
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
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException("Schedule entry not found");
    }

    return entry;
  }

  async update(id: string, dto: any, user: any) {

    // 1. Obtener el estado actual del turno antes de ser modificado (Para auditoría)
    const currentEntry = await this.prisma.scheduleEntry.findFirst({
      where: {
        shiftId: dto.shiftId
      }
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
        shiftTemplateId: dto?.entries[0].shiftTemplateId,
        scheduleId: dto.scheduleId,
        assignedById: user.id,
        organizationId: user.organizationId
        // Si tu esquema maneja organizationId o campos de auditoría heredados:
        // organizationId: user.organizationId 
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
