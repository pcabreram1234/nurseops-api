import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { VacationBalanceService } from "../services/vacation-balance.service";

/**
 * Job de vencimiento de días arrastrados (carry-forward).
 * Se ejecuta diariamente a la medianoche. Expira los días arrastrados cuando
 * se cumple el plazo `carryForwardExpiryMonths` de la política.
 * Idempotente: una vez expirados, no vuelve a procesar el balance.
 */
@Injectable()
export class VacationExpirationJob {
  private readonly logger = new Logger(VacationExpirationJob.name);
  private isRunning = false;

  constructor(private readonly balanceService: VacationBalanceService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    if (this.isRunning) {
      this.logger.warn("Vencimiento de arrastres ya en ejecución; se omite esta pasada.");
      return;
    }

    this.isRunning = true;
    try {
      this.logger.log("Iniciando vencimiento de días arrastrados...");
      const result = await this.balanceService.runExpiration();
      this.logger.log(`Vencimiento finalizado: ${result.processed} balances procesados.`);
    } catch (error: any) {
      this.logger.error(`Error en vencimiento de arrastres: ${error?.message}`, error?.stack);
    } finally {
      this.isRunning = false;
    }
  }
}
