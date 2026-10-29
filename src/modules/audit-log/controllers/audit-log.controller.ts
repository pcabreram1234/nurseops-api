import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";
import { Permissions } from "@modules/auth/decorators/permissions.decorator";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";
import { AuditLogService } from "../services/audit-log.service";
import { AuditLogFilterDto } from "../dto/audit-log-filter.dto";

/**
 * 📖 Auditoría (AuditLog) — EXCLUSIVAMENTE SOLO LECTURA.
 *
 * Este controlador NO expone POST/PATCH/DELETE: los registros de auditoría
 * son inmutables desde la interfaz. Su escritura ocurre únicamente por el
 * pipeline del backend (AuditInterceptor → evento audit.created → AuditProcessor).
 *
 * Permite consultar: valores anterior/posterior (old_value/new_value),
 * dirección IP, agente de usuario y requestId de cada operación.
 */
@Controller({ path: "audit-logs", version: "1" })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditLogController {
  constructor(private readonly service: AuditLogService) {}

  @Get()
  @Permissions("READ_AUDIT_LOGS")
  findAll(@Query() filters: AuditLogFilterDto, @CurrentUser() user: any) {
    return this.service.findAll(filters, user);
  }

  @Get(":id")
  @Permissions("READ_AUDIT_LOGS")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }
}
