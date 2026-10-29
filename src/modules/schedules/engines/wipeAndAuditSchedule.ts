import { PrismaService } from "@infra/database/prisma.service";
import { ActivityLogType, ActionAuditLogTypes } from "@prisma/client";
import { getYear, getMonth } from "date-fns"

interface WipeOptions {
	prisma: PrismaService;
	organizationId: string;
	departmentId: string;
	branchId: string;
	month: number;
	year: number;
	triggeredById: string;
	// Parámetros técnicos opcionales para la tabla audit_logs
	ipAddress?: string;
	userAgent?: string;
	requestId?: string;
}

/**
 * Limpia las tablas con referencias al horario que se va a regenerar
 * e inserta los registros correspondientes en las tablas de auditoría y logs.
 */
export async function wipeAndAuditSchedule(options: WipeOptions): Promise<string | null> {
	const {
		prisma,
		organizationId,
		departmentId,
		branchId,
		month,
		year,
		triggeredById,
		ipAddress = null,
		userAgent = null,
		requestId = null
	} = options;

	console.log("Wipe Schedule Process started.")

	// 1. Buscar si ya existe un horario para este periodo y departamento
	const existingSchedule = await prisma.schedule.findFirst({
		where: {
			departmentId: departmentId,
			branchId: branchId,
			organizationId: organizationId,
			month: month,
			year: year
		}
	});

	console.log(departmentId)
	console.log(organizationId)
	console.log(month)
	console.log(year)

	// 1. Construir el rango de fechas para el mes y año buscado
	// El rango irá desde el primer día de ese mes a las 00:00:00
	const startDate = new Date(year, month - 1, 1);

	// Hasta el primer día del SIGUIENTE mes a las 00:00:00 (menor estricto '<')
	const endDate = new Date(year, month, 1);

	// Intentamos buscar dinámicamente el ID del módulo de "Schedules/Horarios" para audit_logs
	// Si tu tabla Module usa slugs estáticos como "SCHEDULES", búscalo así. Si no, puedes harcodear un UUID válido.
	const scheduleModule = await prisma.module.findFirst({
		where: { code: { contains: "SCHEDULES_MANAGEMENT", mode: "insensitive" } }
	});
	// console.log(scheduleModule);
	const moduleId = scheduleModule?.id || "00000000-0000-0000-0000-000000000000"; // Fallback por seguridad

	if (!existingSchedule) {
		// Registro inicial cuando NO existe un horario previo
		await prisma.$transaction([
			prisma.activityLog.create({
				data: {
					userId: triggeredById,
					action: ActivityLogType.SCHEDULE_GENERATION_STARTED, // Ajusta a tu enum real
					details: {
						message: `Start of automatic initial calendar generation for the period ${month}/${year}.`,
						departmentId,
						branchId,
						month,
						year
					}
				}
			}),
			prisma.auditLog.create({
				data: {
					userId: triggeredById,
					organizationId,
					action: ActionAuditLogTypes.AUTO_GENERATE,
					moduleId,
					old_value: {},
					new_value: { departmentId, branchId, month, year, mode: "INITIAL_GENERATION" },
					ipAddress,
					userAgent,
					requestId
				}
			})
		]);
		return null;
	}

	console.log(`[Wipe & Audit] Previous schedule detected (${existingSchedule.id}). Proceeding to cascade deletion and logs...`);

	// 1. Extraer los IDs de los turnos que están vinculados a este horario específico ANTES de borrar nada
	const shiftsToDelete = await prisma.scheduleEntry.findMany({
		where: { scheduleId: existingSchedule.id },
		select: { shiftId: true },
		distinct: ['shiftId'] // Evita IDs duplicados en memoria
	});

	console.log("Los id de los turnos a borrar son");
	console.log(shiftsToDelete)


	const shiftIds = shiftsToDelete.map(entry => entry.shiftId).filter(Boolean);

	// 2. Ejecutar la limpieza y auditoría en una transacción atómica
	await prisma.$transaction([

		// A) Primero borramos los hijos (Las entradas vinculadas al horario)
		prisma.scheduleEntry.deleteMany({
			where: { scheduleId: existingSchedule.id }
		}),

		// B) Ahora que las entradas murieron, borramos de forma segura los shifts padres 
		// usando la lista de IDs que capturamos en el paso 1
		prisma.shift.deleteMany({
			where: {
				departmentId: departmentId,
				branchId: branchId,
				organizationId: organizationId,
				startTime: {
					gte: startDate,
					lte: endDate
				}
			}
		}),

		// C) Finalmente, si tu lógica requiere eliminar el objeto de control horario principal
		prisma.schedule.delete({
			where: { id: existingSchedule.id }
		}),


		// D) Insertar en la tabla activity_logs (Log Operativo)
		prisma.activityLog.create({
			data: {
				userId: triggeredById,
				action: ActivityLogType.SCHEDULE_REGENERATED, // Ajusta a tu enum real de activity_logs
				details: {
					message: `The user has restarted the calendar generation for the period ${month}/${year} for regeneration reasons.`,
					scheduleId: existingSchedule.id,
					departmentId,
					month,
					year,
					timestamp: new Date().toISOString()
				}
			}
		}),

		// E) Insertar en la tabla audit_logs (Log Técnico de Infraestructura)
		prisma.auditLog.create({
			data: {
				userId: triggeredById,
				organizationId,
				action: ActionAuditLogTypes.AUTO_GENERATE,
				moduleId,
				old_value: {
					scheduleId: existingSchedule.id,
					status: existingSchedule.status,
					updatedAt: (existingSchedule as any).updatedAt
				},
				new_value: {
					message: "Schedule regeneration triggered. Previous entries deleted.",
					scheduleId: existingSchedule.id,
					status: "GENERATING",
					departmentId,
					branchId,
					month,
					year
				},
				ipAddress,
				userAgent,
				requestId
			}
		}),
	]);

	return existingSchedule.id;
}