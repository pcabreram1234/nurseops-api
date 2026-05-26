import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/database/prisma.service';
import { runScheduleEngine } from '../engines/run-schedule-engine'; // Ajusta la ruta correcta
import { addMonths, startOfMonth } from 'date-fns';
import { OperationalAlertyTypes } from '@prisma/client';
import { ActivitySeverity } from '@modules/activity-logs/enums/activity-severity.enum';

@Injectable()
export class ScheduleCronService {
    private readonly logger = new Logger(ScheduleCronService.name);
    private isRunning = false;

    constructor(private readonly prisma: PrismaService) { }

    /**
     * 🕒 Configuración del CRON:
     * Para pruebas locales usa: CronExpression.EVERY_MINUTE (se ejecuta cada minuto)
     * Para producción usa algo como: '0 2 20 * *' (se ejecuta el día 20 de cada mes a las 2:00 AM)
     */
    @Cron(CronExpression.EVERY_10_SECONDS)
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
            const targetDate = startOfMonth(addMonths(new Date(), 1));

            // 2. Buscar todos los departamentos activos que necesitan un horario
            // Traemos también sus plantillas y especialidades para pasárselas al motor
            const departments = await this.prisma.department.findMany({
                where: { isActive: true }, // Asume que tienes un flag de activo
                include: {
                    shiftTemplates: { where: { isActive: true } },
                }
            });

            if (departments.length === 0) {
                this.logger.log('There are no active departments to process at this time..');
                return;
            }

            console.log("The total number of departments are: " + departments.length)

            // ID del bot del sistema para auditoría
            const systemBotId = process.env.SYSTEM_BOT_USER_ID || 'SYSTEM_CRON_BOT';

            // 3. Iterar por cada departamento y correr el motor
            for (const dept of departments) {

                this.logger.log(`⚙️  Processing department: ${dept.name} (${dept.id})`);

                const targetMonth = targetDate.getMonth() + 1;
                const targetYear = targetDate.getFullYear();

                // ==========================================
                // 🛡️ CANDADO: Verificar si ya existe un horario
                // ==========================================
                const existingSchedule = await this.prisma.schedule.findFirst({
                    where: {
                        departmentId: dept.id,
                        month: targetMonth,
                        year: targetYear
                    }
                });

                if (existingSchedule) {
                    this.logger.warn(`⚠️ Skipping ${dept.name}: A schedule already exists for ${targetMonth}/${targetYear}.`);

                    // Guardar alerta en la base de datos
                    await this.prisma.operationalAlert.create({
                        data: {
                            departmentId: dept.id,
                            message: `The Automatic Job attempted to regenerate the schedule for ${targetMonth}/${targetYear}, but it was blocked to protect the existing version.`,
                            alertType: OperationalAlertyTypes.SYSTEM_WARNING, // Ajusta este string al Enum que uses en tu base de datos
                            severity: ActivitySeverity.MEDIUM
                        }
                    });
                    this.isRunning = true;

                    continue; // ⬅️ IMPORTANTE: Salta a la siguiente iteración del bucle sin lanzar el motor
                }

                // --- FILTRADO DE SEGURIDAD AÑADIDO ---
                // Aseguramos que solo pasamos plantillas que realmente pertenecen al depto que estamos procesando
                const departmentShiftTemplates = dept.shiftTemplates.filter(
                    (template) => template.departmentId === dept.id
                );


                // Validaciones de seguridad (opcional pero recomendado)
                if (dept.shiftTemplates.length === 0) {
                    this.logger.warn(`⚠️  Skipping ${dept.name}: It does not have shift templates configured.`);
                    continue;
                }


                // Llamada a tu flamante Schedule Engine
                const result = await runScheduleEngine(
                    this.prisma,
                    dept.organizationId,
                    dept.id,
                    targetDate,
                    departmentShiftTemplates,
                    systemBotId
                );


                if (result.success) {
                    this.logger.log(`✅ Success to ${dept.name}. Schedule DRAFT ID: ${result.scheduleId}`);
                } else {
                    this.logger.error(`❌ Critical failure in ${dept.name}. Reason:`, result.error);
                }
            }

            this.logger.log('🏁 Job completed. All departments have been processed..');

        } catch (error) {
            this.logger.error('💥 Unhandled error during Cron Job execution:', error);
        }
    }
}