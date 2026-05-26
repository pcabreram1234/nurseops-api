import { startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { ScheduleContext } from '../interfaces/shedule-context-interface';
import { PrismaService } from '@infra/database/prisma.service';
import { subDays } from 'date-fns';

export async function buildScheduleContext(
    organizationId: string, departmentId: string, targetDate: Date, // Ej: new Date('2026-06-01')
    prisma: PrismaService
): Promise<ScheduleContext> {

    // 1. Calcular fronteras de tiempo (Mes objetivo y Mes anterior)
    const startOfCurrentMonth = startOfMonth(targetDate);
    const endOfCurrentMonth = endOfMonth(targetDate);
    const startOfPrevMonth = startOfMonth(subMonths(targetDate, 1));
    const endOfPrevMonth = endOfMonth(subMonths(targetDate, 1));

    const sixDaysAgo = subDays(startOfCurrentMonth, 6);

    console.log(`[Engine] Loading context for: ${startOfCurrentMonth.toISOString()} to ${endOfCurrentMonth.toISOString()}`);


    // 2. Disparar TODAS las consultas a la vez en paralelo
    const [
        activeRules,
        orgSettings,
        department,
        nurses,
        vacations,
        leaves,
        availabilities,
        prevMetrics,
        historicalSlots // 👈 NUEVA PIEZA DEL CONTEXTO
    ] = await Promise.all([

        prisma.workRule.findMany({
            where: {
                organizationId: organizationId,
                isActive: true,
                workRuleActions: { some: { enabled: true } },
                workRuleConditions: { some: { enabled: true } }
            },
            include: { workRuleConditions: true, workRuleActions: true }
        }),

        // -> 1. Configuraciones Globales
        prisma.organizationSetting.findUnique({
            where: { organizationId },
        }),


        // -> Configuraciones del Departamento
        prisma.department.findUnique({
            where: { id: departmentId, organizationId: organizationId },
            include: {
                // Asume que tienes las reglas anidadas aquí, ajusta según tu schema
                departmentConfigurations: true
            }
        }),

        // -> 2. Universo de Enfermeras Activas con sus relaciones vitales
        prisma.nurse.findMany({
            where: {
                organizationId: organizationId,
                OR: [
                    { departmentId: departmentId }, // Las propias del depto
                    { isCrossDepartmental: true }   // Las que pueden moverse
                ], status: 'ACTIVE'
            } // Asegurar que solo traemos personal activo},
            ,
            include: {
                nurseProfiles: true,
                speciality: true,
                nurseRestrictions: {
                    where: {
                        // Solo traer restricciones que crucen o estén vigentes este mes
                        OR: [
                            { endDate: { gte: startOfCurrentMonth } },
                            { endDate: null } // Restricciones permanentes
                        ]
                    }
                }
            }
        }),

        // -> 3. Bloqueos temporales: Vacaciones (Cruces de fechas)
        prisma.vacation.findMany({
            where: {
                organizationId: organizationId,
                nurse: {
                    OR: [
                        { departmentId: departmentId },
                        { isCrossDepartmental: true }
                    ]
                },
                status: { in: ['APPROVED', 'IN_PROGRESS'] },
                // Lógica de solapamiento: Inicia antes del fin de mes, y termina después del inicio de mes
                start_Date: { lte: endOfCurrentMonth },
                end_Date: { gte: startOfCurrentMonth }
            }
        }),

        // -> Bloqueos temporales: Ausencias Médicas / Permisos
        prisma.leave.findMany({
            where: {
                departmentId,
                organiztionId: organizationId,
                status: 'APPROVED',
                startDate: { lte: endOfCurrentMonth },
                endDate: { gte: startOfCurrentMonth }
            }
        }),

        // -> Disponibilidad y preferencias puntuales del mes
        prisma.nurseAvailability.findMany({
            where: {
                organizationId: organizationId,
                nurse: {
                    OR: [
                        { departmentId: departmentId },
                        { isCrossDepartmental: true }
                    ]
                },
                date: {
                    gte: startOfCurrentMonth,
                    lte: endOfCurrentMonth
                }
            }
        }),

        // -> 4. Estado Actual: Métricas de fatiga del mes anterior
        prisma.workLoadMetrics.findMany({
            where: {
                nurse: { departmentId, organizationId: organizationId },
                // Asumiendo que guardas el mes y año en WorkloadMetrics. 
                // Si usas fechas, ajusta con startOfPrevMonth y endOfPrevMonth
                month: startOfPrevMonth.getMonth() + 1,
                year: startOfPrevMonth.getFullYear()
            }
        }),

        // Nueva consulta: Traer el cierre del mes anterior ordenado cronológicamente
        prisma.scheduleEntry.findMany({
            where: {
                // Slots que pertenecen al departamento
                shiftTemplate: { departmentId: departmentId },
                // Rango de tiempo: los últimos 6 días del mes anterior
                date: {
                    gte: sixDaysAgo,
                    lt: startOfCurrentMonth
                },
                // Solo nos interesan los slots que sí tuvieron una enfermera asignada
                nurseId: { not: null }
            },
            include: {
                shiftTemplate: true // Necesario para saber si fue nocturno y sus horas
            },
            orderBy: {
                date: 'asc' // 🚨 CRÍTICO: Deben venir en orden cronológico
            }
        })
    ]);

    // 3. Validaciones críticas antes de retornar
    if (!orgSettings) throw new Error("Faltan las configuraciones de la organización.");
    if (!department) throw new Error("El departamento no existe o no tiene configuración.");
    if (nurses.length === 0) throw new Error("No hay enfermeras activas para asignar en este departamento.");

    // 4. Retornar el mapa en memoria
    return {
        settings: {
            organization: orgSettings,
            department: department,
            configurableRules: activeRules.filter(r => r.type === 'CONFIGURABLE') // Fase 1 procesada
        },
        engineRules: {
            hard: activeRules.filter(r => r.type === 'HARD'),
            soft: activeRules.filter(r => r.type === 'SOFT'),
            event: activeRules.filter(r => r.type === 'EVENT')
        },
        nurses,
        blocks: {
            vacations,
            leaves,
            availabilities
        },
        previousMetrics: prevMetrics,
        historicalSlots
    };
}