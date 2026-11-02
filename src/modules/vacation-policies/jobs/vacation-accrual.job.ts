import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { VacationBalanceService } from "../services/vacation-balance.service";

/**
 * Job de devengo mensual de vacaciones.
 * Se ejecuta el día 1 de cada mes a la medianoche (0 0 1 * *).
 * Regla MONTHLY_ACCRUAL: acumula daysGranted / 12 en el balance abierto.
 * Idempotente: no duplica devengos del mismo mes.
 */
@Injectable()
export class VacationAccrualJob {
  private readonly logger = new Logger(VacationAccrualJob.name);
  private isRunning = false;

  constructor(private readonly balanceService: VacationBalanceService) {}

  @Cron("0 0 1 * *")
  async handleCron() {
    if (this.isRunning) {
      this.logger.warn("Devengo mensual ya en ejecución; se omite esta pasada.");
      return;
    }

    this.isRunning = true;
    try {
      this.logger.log("Iniciando devengo mensual de vacaciones...");
      const result = await this.balanceService.runMonthlyAccrual();
      this.logger.log(`Devengo mensual finalizado: ${result.processed} balances actualizados.`);
    } catch (error: any) {
      this.logger.error(`Error en devengo mensual: ${error?.message}`, error?.stack);
    } finally {
      this.isRunning = false;
    }
  }
}
