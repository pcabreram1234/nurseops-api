import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import {
  Prisma,
  VacationCycleType,
  VacationTransactionType,
  VacationPolicy,
  NurseVacationProfile,
} from "@prisma/client";

type Tx = Prisma.TransactionClient;

export interface VacationPeriod {
  periodStart: Date;
  periodEnd: Date;
}

@Injectable()
export class VacationBalanceService {
  private readonly logger = new Logger(VacationBalanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================================================
  // CÁLCULO DE PERÍODO
  // ==========================================================================

  /**
   * Calcula el período de vacaciones que contiene a `referenceDate`.
   * - CALENDAR_YEAR / FISCAL_YEAR: anclado en cycleStartMonth/cycleStartDay.
   * - ANNIVERSARY: anclado en mes/día de la antigüedad reconocida.
   */
  calculatePeriod(
    policy: Pick<
      VacationPolicy,
      "cycleType" | "cycleStartMonth" | "cycleStartDay"
    >,
    referenceDate: Date,
    seniorityAnchor?: Date | null,
  ): VacationPeriod {
    const anchorMonth = Math.min(11, Math.max(0, (policy.cycleStartMonth || 1) - 1));
    const anchorDay = Math.min(31, Math.max(1, policy.cycleStartDay || 1));

    if (policy.cycleType === VacationCycleType.ANNIVERSARY) {
      const anchor = seniorityAnchor ?? referenceDate;
      let start = new Date(
        referenceDate.getFullYear(),
        anchor.getMonth(),
        anchor.getDate(),
      );
      if (start > referenceDate) {
        start = new Date(referenceDate.getFullYear() - 1, anchor.getMonth(), anchor.getDate());
      }
      const end = new Date(start);
      end.setFullYear(end.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
      return { periodStart: start, periodEnd: end };
    }

    // CALENDAR_YEAR y FISCAL_YEAR: ancla fija en el año
    let start = new Date(referenceDate.getFullYear(), anchorMonth, anchorDay);
    if (start > referenceDate) {
      start = new Date(referenceDate.getFullYear() - 1, anchorMonth, anchorDay);
    }
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    return { periodStart: start, periodEnd: end };
  }

  // ==========================================================================
  // REGLA APLICABLE
  // ==========================================================================

  /**
   * Regla aplicable por antigüedad, tipo de contrato y vigencia de fechas.
   * Ordenada por prioridad (mayor primero).
   */
  findApplicableRule(
    policy: VacationPolicy & { rules: any[] },
    profile: NurseVacationProfile,
    atDate: Date = new Date(),
  ): any | null {
    const seniorityMonths = this.seniorityMonths(profile, atDate);

    const candidates = policy.rules.filter((rule) => {
      if (!rule.isActive) return false;
      if (seniorityMonths < rule.seniorityFromMonths) return false;
      if (rule.seniorityToMonths != null && seniorityMonths > rule.seniorityToMonths) return false;
      if (rule.effectiveFrom && rule.effectiveFrom > atDate) return false;
      if (rule.effectiveTo && rule.effectiveTo < atDate) return false;
      if (
        rule.contractTypes &&
        Array.isArray(rule.contractTypes) &&
        rule.contractTypes.length > 0 &&
        profile.contractType &&
        !rule.contractTypes.includes(profile.contractType)
      ) {
        return false;
      }
      return true;
    });

    candidates.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    return candidates[0] ?? null;
  }

  seniorityMonths(profile: NurseVacationProfile, atDate: Date = new Date()): number {
    const start = profile.recognizedSeniorityDate || profile.hireDate;
    const months =
      (atDate.getFullYear() - start.getFullYear()) * 12 +
      (atDate.getMonth() - start.getMonth());
    return Math.max(0, months);
  }

  // ==========================================================================
  // BALANCE ABIERTO (con auto-creación del período actual)
  // ==========================================================================

  /**
   * Devuelve el balance abierto del período vigente del perfil. Si no existe,
   * lo crea con el snapshot de la política y registra el ACCRUAL inicial cuando
   * el método de devengo es ANNUAL_GRANT (idempotente).
   */
  async ensureOpenBalance(
    profile: NurseVacationProfile,
    policy: VacationPolicy & { rules: any[] },
    tx?: Tx,
  ): Promise<{ balanceId: string; created: boolean }> {
    const client = tx ?? this.prisma;
    const now = new Date();
    const { periodStart, periodEnd } = this.calculatePeriod(
      policy,
      now,
      profile.recognizedSeniorityDate || profile.hireDate,
    );

    const existing = await client.vacationBalance.findFirst({
      where: {
        profileId: profile.id,
        closedAt: null,
        periodStart: { lte: now },
        periodEnd: { gte: now },
      },
      orderBy: { periodStart: "desc" },
    });

    if (existing) {
      return { balanceId: existing.id, created: false };
    }

    const rule = this.findApplicableRule(policy, profile, now);
    const daysGranted = rule ? Number(rule.daysGranted) : 0;
    const isAnnualGrant = !rule || rule.accrualMethod === "ANNUAL_GRANT";

    const balance = await client.vacationBalance.create({
      data: {
        organizationId: profile.organizationId,
        profileId: profile.id,
        policyId: policy.id,
        policyVersion: policy.version,
        periodStart,
        periodEnd,
        accruedDays: isAnnualGrant ? daysGranted : 0,
        availableDays: isAnnualGrant ? daysGranted : 0,
        policySnapshot: {
          code: policy.code,
          name: policy.name,
          version: policy.version,
          dayBasis: policy.dayBasis,
          cycleType: policy.cycleType,
          rule: rule
            ? {
                name: rule.name,
                daysGranted: Number(rule.daysGranted),
                accrualMethod: rule.accrualMethod,
                seniorityFromMonths: rule.seniorityFromMonths,
                seniorityToMonths: rule.seniorityToMonths,
              }
            : null,
        } as Prisma.InputJsonValue,
      },
    });

    if (isAnnualGrant && daysGranted > 0) {
      await client.vacationTransaction.create({
        data: {
          organizationId: profile.organizationId,
          balanceId: balance.id,
          type: VacationTransactionType.ACCRUAL,
          days: daysGranted,
          effectiveDate: periodStart,
          reason: "Otorgamiento anual de días según política",
          idempotencyKey: `ACCRUAL:${balance.id}:${this.dateKey(periodStart)}`,
          balanceAfter: this.snapshot(balance, { accruedDays: daysGranted, availableDays: daysGranted }),
          createdById: null,
        },
      });
    }

    return { balanceId: balance.id, created: true };
  }

  // ==========================================================================
  // JOB 1: DEVENGO MENSUAL
  // ==========================================================================

  /**
   * Devengo mensual para reglas MONTHLY_ACCRUAL: daysGranted / 12 por mes.
   * Idempotente vía idempotencyKey `ACCRUAL:{balanceId}:{YYYY-MM}`.
   */
  async runMonthlyAccrual(now: Date = new Date()): Promise<{ processed: number }> {
    const profiles = await this.prisma.nurseVacationProfile.findMany({
      where: { isActive: true },
      include: { policy: { include: { rules: true } }, balances: true },
    });

    let processed = 0;

    for (const profile of profiles) {
      const rule = this.findApplicableRule(profile.policy, profile, now);
      if (!rule || rule.accrualMethod !== "MONTHLY_ACCRUAL") continue;

      const open = profile.balances.find((b) => !b.closedAt);
      if (!open) continue;

      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const idempotencyKey = `ACCRUAL:${open.id}:${monthKey}`;

      const already = await this.prisma.vacationTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (already) continue;

      // Devengo mensual = días otorgados / 12 (redondeado a 2 decimales)
      const monthlyDays = Math.round((Number(rule.daysGranted) / 12) * 100) / 100;
      if (monthlyDays <= 0) continue;

      await this.prisma.$transaction(async (tx) => {
        const updated = await tx.vacationBalance.update({
          where: { id: open.id },
          data: {
            accruedDays: { increment: monthlyDays },
            availableDays: { increment: monthlyDays },
            version: { increment: 1 },
          },
        });

        await tx.vacationTransaction.create({
          data: {
            organizationId: profile.organizationId,
            balanceId: open.id,
            type: VacationTransactionType.ACCRUAL,
            days: monthlyDays,
            effectiveDate: now,
            reason: `Devengo mensual (${monthKey}) según política`,
            idempotencyKey,
            balanceAfter: this.snapshot(updated),
            createdById: null,
          },
        });
      });

      processed++;
    }

    this.logger.log(`Devengo mensual completado: ${processed} balances actualizados`);
    return { processed };
  }

  // ==========================================================================
  // JOB 2: VENCIMIENTO DE DÍAS ARRASTRADOS
  // ==========================================================================

  /**
   * Expira los días arrastrados (carry-forward) cuando se cumple el plazo
   * `carryForwardExpiryMonths` desde el inicio del período. Idempotente vía
   * `EXPIRATION:CF:{balanceId}`.
   */
  async runExpiration(now: Date = new Date()): Promise<{ processed: number }> {
    const balances = await this.prisma.vacationBalance.findMany({
      where: {
        closedAt: null,
        carriedInDays: { gt: 0 },
        profile: {
          policy: { carryForwardEnabled: true, carryForwardExpiryMonths: { not: null } },
        },
      },
      include: {
        profile: { include: { policy: true } },
      },
    });

    let processed = 0;

    for (const balance of balances) {
      const expiryMonths = balance.profile.policy.carryForwardExpiryMonths;
      if (expiryMonths == null) continue;

      const expiryDate = new Date(balance.periodStart);
      expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);
      if (now < expiryDate) continue;

      const idempotencyKey = `EXPIRATION:CF:${balance.id}`;
      const already = await this.prisma.vacationTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (already) continue;

      // Expira lo arrastrado que no se consumió (limitado por lo disponible)
      const carried = Number(balance.carriedInDays);
      const expirable = Math.min(carried, Number(balance.availableDays));
      if (expirable <= 0) continue;

      await this.prisma.$transaction(async (tx) => {
        const updated = await tx.vacationBalance.update({
          where: { id: balance.id },
          data: {
            expiredDays: { increment: expirable },
            availableDays: { decrement: expirable },
            version: { increment: 1 },
          },
        });

        await tx.vacationTransaction.create({
          data: {
            organizationId: balance.organizationId,
            balanceId: balance.id,
            type: VacationTransactionType.EXPIRATION,
            days: expirable,
            effectiveDate: expiryDate,
            reason: `Vencimiento de días arrastrados (${expiryMonths} meses)`,
            idempotencyKey,
            balanceAfter: this.snapshot(updated),
            createdById: null,
          },
        });
      });

      processed++;
    }

    this.logger.log(`Vencimiento de arrastres completado: ${processed} balances procesados`);
    return { processed };
  }

  // ==========================================================================
  // JOB 3: CIERRE DE CICLO
  // ==========================================================================

  /**
   * Cierra balances cuyo período terminó: arrastra el máximo permitido
   * (carryForwardEnabled + maxCarryForwardDays), expira el resto y abre el
   * balance del siguiente período. Idempotente por construcción (solo procesa
   * balances abiertos con período vencido).
   */
  async runCycleClose(now: Date = new Date()): Promise<{ processed: number }> {
    const balances = await this.prisma.vacationBalance.findMany({
      where: { closedAt: null, periodEnd: { lt: now } },
      include: {
        profile: { include: { policy: { include: { rules: true } } } },
      },
    });

    let processed = 0;

    for (const balance of balances) {
      const policy = balance.profile.policy;
      const profile = balance.profile;

      const remaining = Number(balance.availableDays);
      let carry = 0;
      if (policy.carryForwardEnabled && remaining > 0) {
        const maxCarry = policy.maxCarryForwardDays != null ? Number(policy.maxCarryForwardDays) : remaining;
        carry = Math.min(remaining, maxCarry);
      }
      const expiring = Math.max(0, remaining - carry);

      await this.prisma.$transaction(async (tx) => {
        // 1. Expirar lo no arrastrable
        if (expiring > 0) {
          const closed = await tx.vacationBalance.update({
            where: { id: balance.id },
            data: {
              expiredDays: { increment: expiring },
              availableDays: { decrement: expiring },
              closedAt: now,
              version: { increment: 1 },
            },
          });

          await tx.vacationTransaction.create({
            data: {
              organizationId: balance.organizationId,
              balanceId: balance.id,
              type: VacationTransactionType.EXPIRATION,
              days: expiring,
              effectiveDate: balance.periodEnd,
              reason: "Vencimiento al cierre de ciclo (días no arrastrables)",
              idempotencyKey: `EXPIRATION:CLOSE:${balance.id}`,
              balanceAfter: this.snapshot(closed),
              createdById: null,
            },
          });
        } else {
          await tx.vacationBalance.update({
            where: { id: balance.id },
            data: { closedAt: now, version: { increment: 1 } },
          });
        }

        // 2. Abrir el balance del siguiente período con el arrastre
        const nextPeriod = this.calculatePeriod(
          policy,
          new Date(balance.periodEnd.getTime() + 24 * 60 * 60 * 1000),
          profile.recognizedSeniorityDate || profile.hireDate,
        );

        const nextBalance = await tx.vacationBalance.create({
          data: {
            organizationId: balance.organizationId,
            profileId: profile.id,
            policyId: policy.id,
            policyVersion: policy.version,
            periodStart: nextPeriod.periodStart,
            periodEnd: nextPeriod.periodEnd,
            accruedDays: 0,
            carriedInDays: carry,
            availableDays: carry,
            policySnapshot: balance.policySnapshot as Prisma.InputJsonValue,
          },
        });

        if (carry > 0) {
          await tx.vacationTransaction.create({
            data: {
              organizationId: balance.organizationId,
              balanceId: nextBalance.id,
              type: VacationTransactionType.CARRY_FORWARD,
              days: carry,
              effectiveDate: nextPeriod.periodStart,
              reason: "Días arrastrados al nuevo ciclo",
              idempotencyKey: `CARRY_FORWARD:${nextBalance.id}`,
              balanceAfter: this.snapshot(nextBalance),
              createdById: null,
            },
          });
        }

        // 3. Devengo inicial del nuevo período si corresponde ANNUAL_GRANT
        const rule = this.findApplicableRule(policy, profile, nextPeriod.periodStart);
        if (rule && rule.accrualMethod === "ANNUAL_GRANT" && Number(rule.daysGranted) > 0) {
          const granted = Number(rule.daysGranted);
          const withGrant = await tx.vacationBalance.update({
            where: { id: nextBalance.id },
            data: {
              accruedDays: { increment: granted },
              availableDays: { increment: granted },
              version: { increment: 1 },
            },
          });

          await tx.vacationTransaction.create({
            data: {
              organizationId: balance.organizationId,
              balanceId: nextBalance.id,
              type: VacationTransactionType.ACCRUAL,
              days: granted,
              effectiveDate: nextPeriod.periodStart,
              reason: "Otorgamiento anual de días (nuevo ciclo)",
              idempotencyKey: `ACCRUAL:${nextBalance.id}:${this.dateKey(nextPeriod.periodStart)}`,
              balanceAfter: this.snapshot(withGrant),
              createdById: null,
            },
          });
        }
      });

      processed++;
    }

    this.logger.log(`Cierre de ciclo completado: ${processed} balances cerrados`);
    return { processed };
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private dateKey(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  private snapshot(
    balance: {
      accruedDays: Prisma.Decimal | number;
      carriedInDays?: Prisma.Decimal | number;
      usedDays: Prisma.Decimal | number;
      reservedDays: Prisma.Decimal | number;
      availableDays: Prisma.Decimal | number;
      expiredDays?: Prisma.Decimal | number;
      version: number;
    },
    override?: Record<string, number>,
  ): Prisma.InputJsonValue {
    return {
      accruedDays: Number(override?.accruedDays ?? balance.accruedDays),
      carriedInDays: Number(override?.carriedInDays ?? balance.carriedInDays ?? 0),
      usedDays: Number(override?.usedDays ?? balance.usedDays),
      reservedDays: Number(override?.reservedDays ?? balance.reservedDays),
      availableDays: Number(override?.availableDays ?? balance.availableDays),
      expiredDays: Number(override?.expiredDays ?? balance.expiredDays ?? 0),
      version: balance.version,
    };
  }
}
