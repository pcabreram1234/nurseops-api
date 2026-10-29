import { Processor, WorkerHost } from "@nestjs/bullmq";
import { PrismaService } from "@infra/database/prisma.service";
import { AuditSanitizerService } from "../services/audit-sanitizer.service";

/**
 * Mapeo de segmentos de ruta (extraídos por el AuditInterceptor) a códigos
 * de módulo existentes en la tabla `modules` (sembrada en DummyData.sql).
 * Si no hay coincidencia se usa un módulo core como fallback, y en el peor
 * de los casos se crea de forma idempotente un módulo SYSTEM.
 */
const MODULE_CODE_BY_PATH: Record<string, string> = {
  // Gestión de cuadrantes
  schedules: "SCHEDULES_MANAGEMENT",
  "schedule-entries": "SCHEDULES_MANAGEMENT",
  "schedules-publication": "SCHEDULES_MANAGEMENT",
  "schedule-validation": "SCHEDULES_MANAGEMENT",
  "schedule-versions": "SCHEDULES_MANAGEMENT",
  "shift-templates": "SCHEDULES_MANAGEMENT",
  shifts: "SCHEDULES_MANAGEMENT",
  "shift-change-requests": "SCHEDULES_MANAGEMENT",
  "shift-change-approvals": "SCHEDULES_MANAGEMENT",
  "shift-change-documents": "SCHEDULES_MANAGEMENT",
  // Motor de reglas
  "work-rules": "WORK_RULES",
  "work-rule-conditions": "WORK_RULES",
  "work-rule-actions": "WORK_RULES",
  "rule-groups": "WORK_RULES",
  // Licencias y ausencias
  absences: "LEAVES_MANAGEMENT",
  vacations: "LEAVES_MANAGEMENT",
  leaves: "LEAVES_MANAGEMENT",
  "nurse-availability": "LEAVES_MANAGEMENT",
  // Personal
  nurses: "STAFF_MANAGEMENT",
  users: "STAFF_MANAGEMENT",
  roles: "STAFF_MANAGEMENT",
  departments: "STAFF_MANAGEMENT",
  branches: "STAFF_MANAGEMENT",
  specialities: "STAFF_MANAGEMENT",
  "department-configurations": "STAFF_MANAGEMENT",
  // Métricas, alertas y análisis
  "operational-alerts": "CLINICAL_ANALYTICS",
  "workload-metrics": "CLINICAL_ANALYTICS",
  "optimization-runs": "CLINICAL_ANALYTICS",
  "optimization-scores": "CLINICAL_ANALYTICS",
  // Estructura hospitalaria
  organizations: "ORGANIZATION_STRUCTURE",
  // Integraciones y webhooks
  integrations: "INTEGRATIONS_WEBHOOKS",
  "webhook-logs": "INTEGRATIONS_WEBHOOKS",
  // Auditoría
  "audit-logs": "AUDIT_LOGS",
  "activity-logs": "AUDIT_LOGS",
  // Sistema
  "notification-types": "SYSTEM_SETTINGS",
  "notification-templates": "SYSTEM_SETTINGS",
  notifications: "SYSTEM_SETTINGS",
  modules: "SYSTEM_SETTINGS",
};

@Processor("audit")
export class AuditProcessor extends WorkerHost {
    constructor(
        private readonly prisma: PrismaService,
        private readonly sanitizer: AuditSanitizerService,
    ) {
        super();
    }

    async process(job: any) {
        const payload = job.data;

        const moduleId = await this.resolveModuleId(payload?.module);

        // Escritura tolerante a fallos: si un registro individual no puede
        // persistirse no debe tumbar la cola de auditoría.
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: payload?.context?.userId || null,
                    organizationId: payload?.context?.organizationId || null,
                    action: payload?.action || "UPDATE",
                    moduleId,
                    // Valores anterior/posterior cuando el productor los informa
                    old_value: this.sanitizer.sanitize(payload?.oldValue ?? {}) ?? {},
                    new_value: this.sanitizer.sanitize(payload?.response) ?? {},
                    ipAddress: payload?.context?.ipAddress || null,
                    userAgent: payload?.context?.userAgent || null,
                    requestId: payload?.context?.requestId || null,
                },
            });
        } catch (error: any) {
            console.error("[AuditProcessor] No se pudo persistir el registro de auditoría:", error?.message);
        }
    }

    /**
     * Resuelve un `moduleId` válido (FK obligatorio hacia la tabla modules).
     */
    private async resolveModuleId(pathSegment?: string): Promise<string> {
        try {
            const code = pathSegment ? MODULE_CODE_BY_PATH[pathSegment] : undefined;
            if (code) {
                const mod = await this.prisma.module.findUnique({ where: { code } });
                if (mod) return mod.id;
            }

            const fallback = await this.prisma.module.findFirst({
                where: { code: "DASHBOARD" },
            });
            if (fallback) return fallback.id;

            const anyCore = await this.prisma.module.findFirst({
                where: { isCore: true },
                orderBy: { createdAt: "asc" },
            });
            if (anyCore) return anyCore.id;

            const created = await this.prisma.module.upsert({
                where: { code: "SYSTEM" },
                update: {},
                create: {
                    code: "SYSTEM",
                    name: "Sistema",
                    description: "Registro de auditoría genérico",
                    isCore: false,
                    isSystem: true,
                },
            });
            return created.id;
        } catch (error: any) {
            console.error("[AuditProcessor] No se pudo resolver moduleId:", error?.message);
            // Último recurso: registrar con un módulo core por defecto
            const anyMod = await this.prisma.module.findFirst({ orderBy: { createdAt: "asc" } });
            if (!anyMod) throw error;
            return anyMod.id;
        }
    }
}
