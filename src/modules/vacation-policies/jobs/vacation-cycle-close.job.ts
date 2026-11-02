import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { VacationBalanceService } from "../services/vacation-balance.service";

/**
 * Job de cierre de ciclo de vacaciones.
 * Se ejecuta diariamente a la medianoche. Cierra los balances cuyo período
 * terminó, arrastra el máximo permitido por política, expira el resto y abre
 * el balance del nuevo período (con devengo ANNUAL_GRANT si aplica).
 */
@Injectable()
export class VacationCycleCloseJob {
  private readonly logger = new Logger(VacationCycleCloseJob.name);
  private isRunning = false;

  constructor(private readonly balanceService: VacationBalanceService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    if (this.isRunning) {
      this.logger.warn("Cierre de ciclo ya en ejecución; se omite esta pasada.");
      return;
    }

    this.isRunning = true;
    try {
      this.logger.log("Iniciando cierre de ciclo de vacaciones...");
      const result = await this.balanceService.runCycleClose();
      this.logger.log(`Cierre de ciclo finalizado: ${result.processed} balances cerrados.`);
    } catch (error: any) {
      this.logger.error(`Error en cierre de ciclo: ${error?.message}`, error?.stack);
    } finally {
      this.isRunning = false;
    }
  }
}
