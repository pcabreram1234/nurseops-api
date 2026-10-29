import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { runScheduleEngine } from '../engines/run-schedule-engine'; // Ajusta la ruta correcta
import { addMonths, startOfMonth } from 'date-fns';
import { OperationalAlertyTypes } from '@prisma/client';
import { ActivitySeverity } from '@modules/activity-logs/enums/activity-severity.enum';

@Injectable()
export class ScheduleCronService {
    private readonly logger = new Logger(ScheduleCronService.name);
    private isRunning = false;

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    /**
     * 🕒 Configuración del CRON:
     * Para pruebas locales usa: CronExpression.EVERY_MINUTE (se ejecuta cada minuto)
     * Para producción usa algo como: '0 2 20 * *' (se ejecuta el día 20 de cada mes a las 2:00 AM)
     */
    @Cron(CronExpression.EVERY_12_HOURS)
    async handleMonthlyScheduleGeneration() {
        if (this.isRunning) {
            this.logger.warn('⚠️ The job is already running. Skipping this iteration.');
            return;
        }
        this.logger.log('🤖 Waking Up Job: Initiating automated schedule generation...');

        this.isRunning = true; // Bloqueamos el inicio de otros


        try {
            // 1. Determinar la fecha objetivo (Por defecto, el motor calcula para el PRÓXIMO mes)
            // Si estamos en mayo, esto calculará el horario de junio.
            const targetDate = startOfMonth(addMonths(new Date(), 0));

            // 2. Buscar todos los departamentos activos que necesitan un horario.
            // Un departamento puede operar en varias sedes, por lo que se genera un
            // horario independiente por cada combinación departamento/sede.
            const departments = await this.prisma.department.findMany({
                where: { isActive: true },
                include: {
                    branches: {
                        include: { branch: true },
                    },
                },
            });

            if (departments.length === 0) {
                this.logger.log('There are no active departments to process at this time..');
                return;
            }

            console.log("The total number of departments are: " + departments.length)

            // ID del bot del sistema para auditoría
            const systemBotId = process.env.SYSTEM_BOT_USER_ID || 'SYSTEM_CRON_BOT';

            // 3. Iterar por cada departamento/sede y correr el motor
            for (const dept of departments) {
                const targetMonth = targetDate.getMonth() + 1;
                const targetYear = targetDate.getFullYear();

                for (const departmentBranch of dept.branches) {
                    const branchId = departmentBranch.branchId;

                    this.logger.log(
                        `⚙️  Processing department: ${dept.name} (${dept.id}) at branch ${departmentBranch.branch?.name ?? branchId}`,
                    );

                    // Plantillas de la sede: compartidas entre departamentos (departmentId null)
                    // o específicas del departamento.
                    const branchShiftTemplates = await this.prisma.shiftTemplate.findMany({
                        where: {
                            organizationId: dept.organizationId,
                            branchId,
                            isActive: true,
                            OR: [{ departmentId: dept.id }, { departmentId: null }],
                        },
                    });

                    if (branchShiftTemplates.length === 0) {
                        this.logger.warn(
                            `⚠️  Skipping ${dept.name} at ${branchId}: It does not have shift templates configured for this branch.`,
                        );
                        continue;
                    }

                    // ==========================================
                    // 🛡️ CANDADO: Verificar si ya existe un horario
                    // ==========================================
                    const existingSchedule = await this.prisma.schedule.findFirst({
                        where: {
                            departmentId: dept.id,
                            branchId,
                            month: targetMonth,
                            year: targetYear,
                        },
                    });

                    if (existingSchedule) {
                        this.logger.warn(
                            `⚠️ Skipping ${dept.name} at ${branchId}: A schedule already exists for ${targetMonth}/${targetYear}.`,
                        );

                        // Guardar alerta en la base de datos
                        await this.prisma.operationalAlert.create({
                            data: {
                                departmentId: dept.id,
                                message: `The Automatic Job attempted to regenerate the schedule for ${targetMonth}/${targetYear} at branch ${branchId}, but it was blocked to protect the existing version.`,
                                alertType: OperationalAlertyTypes.SYSTEM_WARNING,
                                severity: ActivitySeverity.MEDIUM,
                            },
                        });

                        continue;
                    }

                    // Llamada a tu flamante Schedule Engine
                    const result = await runScheduleEngine(
                        this.prisma,
                        dept.organizationId,
                        dept.id,
                        branchId,
                        targetDate,
                        branchShiftTemplates,
                        systemBotId,
                        this.eventEmitter,
                    );

                    if (result.success) {
                        this.logger.log(`✅ Success to ${dept.name} at ${branchId}. Schedule DRAFT ID: ${result.scheduleId}`);
                    } else {
                        this.logger.error(`❌ Critical failure in ${dept.name} at ${branchId}. Reason:`, result.error);
                    }
                }
            }

            this.logger.log('🏁 Job completed. All departments have been processed..');

        } catch (error) {
            this.logger.error('💥 Unhandled error during Cron Job execution:', error);
        } finally {
            this.isRunning = false;
        }
    }
}