import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";

/**
 * Reportes para RR.HH: políticas activadas, perfiles asignados y saldos
 * por organización.
 */
@Injectable()
export class VacationReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Resumen ejecutivo de políticas por estado y versión. */
  async getPoliciesReport(user: any) {
    const organizationId = this.requireOrg(user);

    const [byStatus, policies, supersededCount] = await Promise.all([
      this.prisma.vacationPolicy.groupBy({
        by: ["status"],
        where: { organizationId },
        _count: { id: true },
      }),
      this.prisma.vacationPolicy.findMany({
        where: { organizationId },
        select: {
          id: true,
          code: true,
          name: true,
          status: true,
          version: true,
          regimeCode: true,
          effectiveFrom: true,
          effectiveTo: true,
          legalReference: true,
          _count: { select: { profiles: true, vacations: true } },
        },
        orderBy: [{ code: "asc" }, { version: "desc" }],
      }),
      this.prisma.vacationPolicy.count({
        where: { organizationId, supersedesPolicyId: { not: null } },
      }),
    ]);

    return {
      summary: {
        total: policies.length,
        byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
        versionedPolicies: supersededCount,
      },
      policies,
    };
  }

  /** Perfiles de vacaciones asignados (con su política y saldo vigente). */
  async getProfilesReport(user: any, filters?: { nurseId?: string; policyId?: string }) {
    const organizationId = this.requireOrg(user);

    const profiles = await this.prisma.nurseVacationProfile.findMany({
      where: {
        organizationId,
        ...(filters?.nurseId && { nurseId: filters.nurseId }),
        ...(filters?.policyId && { policyId: filters.policyId }),
      },
      include: {
        policy: { select: { id: true, code: true, name: true, version: true, dayBasis: true } },
        nurse: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            department: { select: { name: true } },
          },
        },
        balances: {
          where: { closedAt: null },
          select: {
            id: true,
            periodStart: true,
            periodEnd: true,
            accruedDays: true,
            carriedInDays: true,
            usedDays: true,
            reservedDays: true,
            availableDays: true,
            expiredDays: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      total: profiles.length,
      profiles: profiles.map((p) => ({
        id: p.id,
        nurse: {
          id: p.nurseId,
          name: `${p.nurse.user?.firstName ?? ""} ${p.nurse.user?.lastName ?? ""}`.trim(),
          department: p.nurse.department?.name,
        },
        policy: p.policy,
        regimeCode: p.regimeCode,
        contractType: p.contractType,
        effectiveFrom: p.effectiveFrom,
        effectiveTo: p.effectiveTo,
        isActive: p.isActive,
        openBalance: p.balances[0] ?? null,
      })),
    };
  }

  /** Saldos agregados por organización (y detalle por departamento). */
  async getBalancesReport(user: any) {
    const organizationId = this.requireOrg(user);

    const [totals, byDepartment] = await Promise.all([
      this.prisma.vacationBalance.aggregate({
        where: { organizationId, closedAt: null },
        _sum: {
          accruedDays: true,
          carriedInDays: true,
          usedDays: true,
          reservedDays: true,
          availableDays: true,
          expiredDays: true,
        },
        _count: { id: true },
      }),
      this.prisma.vacationBalance.findMany({
        where: { organizationId, closedAt: null },
        select: {
          accruedDays: true,
          carriedInDays: true,
          usedDays: true,
          reservedDays: true,
          availableDays: true,
          expiredDays: true,
          profile: {
            select: {
              nurse: { select: { departmentId: true, department: { select: { name: true } } } },
            },
          },
        },
      }),
    ]);

    // Agregación por departamento
    const deptMap = new Map<
      string,
      { name: string; balances: number; accrued: number; used: number; reserved: number; available: number }
    >();

    for (const balance of byDepartment) {
      const dept = balance.profile.nurse.department;
      const deptId = balance.profile.nurse.departmentId ?? "sin-departamento";
      const entry = deptMap.get(deptId) ?? {
        name: dept?.name ?? "Sin departamento",
        balances: 0,
        accrued: 0,
        used: 0,
        reserved: 0,
        available: 0,
      };
      entry.balances += 1;
      entry.accrued += Number(balance.accruedDays);
      entry.used += Number(balance.usedDays);
      entry.reserved += Number(balance.reservedDays);
      entry.available += Number(balance.availableDays);
      deptMap.set(deptId, entry);
    }

    return {
      totals: {
        openBalances: totals._count.id,
        accruedDays: Number(totals._sum.accruedDays ?? 0),
        carriedInDays: Number(totals._sum.carriedInDays ?? 0),
        usedDays: Number(totals._sum.usedDays ?? 0),
        reservedDays: Number(totals._sum.reservedDays ?? 0),
        availableDays: Number(totals._sum.availableDays ?? 0),
        expiredDays: Number(totals._sum.expiredDays ?? 0),
      },
      byDepartment: Array.from(deptMap.values()),
    };
  }

  private requireOrg(user: any): string {
    const organizationId = user?.organizationId;
    if (!organizationId) {
      throw new BadRequestException("Organization ID is required");
    }
    return organizationId;
  }
}
