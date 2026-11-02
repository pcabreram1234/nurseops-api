import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { DashboardFilterDto } from '../dto/dashboard-filter.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private buildOrgFilter(user: any, filters?: DashboardFilterDto) {
    if (user?.role === 'SUPER') {
      if (filters?.organizationId) {
        return { organizationId: filters.organizationId };
      }
      return {};
    }
    if (!user?.organizationId) {
      throw new ForbiddenException('User has no organization assigned');
    }
    return { organizationId: user.organizationId };
  }

  async getSummary(user: any, filters: DashboardFilterDto = {}) {
    const orgFilter = this.buildOrgFilter(user, filters);
    const isSuper = user?.role === 'SUPER';

    // Fecha de hoy en UTC para comparación consistente
    const today = new Date();
    const startOfToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const endOfToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999));

    // Filtros para schedule entries
    const scheduleEntryFilter: any = {
      ...orgFilter,
      ...(filters?.departmentId ? { shiftTemplate: { departmentId: filters.departmentId } } : {}),
    };

    // Obtener totales en paralelo
    const [
      totalOrganizations,
      activeOrganizations,
      totalDepartments,
      totalNurses,
      activeNurses,
      totalUsers,
      scheduleEntriesToday,
      scheduleEntriesAll,
      openAlerts,
      criticalAlerts,
      pendingAbsences,
      approvedVacations,
      activityLogs,
      recentScheduleEntries,
      departmentsList,
      organizationsList,
    ] = await Promise.all([
      isSuper ? this.prisma.organization.count() : Promise.resolve(0),
      isSuper ? this.prisma.organization.count({ where: { status: 'A' } }) : Promise.resolve(0),
      this.prisma.department.count({ where: orgFilter.organizationId ? { organizationId: orgFilter.organizationId } : {} }),
      this.prisma.nurse.count({ where: orgFilter }),
      this.prisma.nurse.count({ where: { ...orgFilter, status: 'ACTIVE' } }),
      this.prisma.user.count({ where: orgFilter }),
      this.prisma.scheduleEntry.count({
        where: {
          ...scheduleEntryFilter,
          date: { gte: startOfToday, lte: endOfToday },
        },
      }),
      this.prisma.scheduleEntry.count({ where: scheduleEntryFilter }),
      this.prisma.operationalAlert.count({
        where: {
          status: { in: ['OPEN', 'IN_PROGRESS', 'ESCALATED'] },
          ...(orgFilter.organizationId ? { department: { organizationId: orgFilter.organizationId } } : {}),
          ...(filters?.departmentId ? { departmentId: filters.departmentId } : {}),
        },
      }),
      this.prisma.operationalAlert.count({
        where: {
          status: { in: ['OPEN', 'IN_PROGRESS', 'ESCALATED'] },
          severity: { in: ['CRITICAL', 'URGENT'] },
          ...(orgFilter.organizationId ? { department: { organizationId: orgFilter.organizationId } } : {}),
          ...(filters?.departmentId ? { departmentId: filters.departmentId } : {}),
        },
      }),
      this.prisma.absence.count({
        where: {
          ...orgFilter,
          status: { in: ['PENDING', 'APPROVED'] },
        },
      }),
      this.prisma.absence.count({
        where: {
          ...orgFilter,
          type: 'VACATION',
          status: 'APPROVED',
          date: { lte: endOfToday },
          endDate: { gte: startOfToday },
        },
      }),
      this.prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.scheduleEntry.findMany({
        where: {
          ...scheduleEntryFilter,
          date: { gte: startOfToday, lte: endOfToday },
        },
        take: 20,
        orderBy: { date: 'asc' },
        include: {
          nurse: { include: { user: { select: { firstName: true, lastName: true } } } },
          shift: { select: { name: true, startTime: true, endTime: true, type: true } },
          shiftTemplate: { select: { name: true, department: { select: { name: true } } } },
        },
      }),
      this.prisma.department.findMany({
        where: orgFilter.organizationId ? { organizationId: orgFilter.organizationId } : {},
        include: { _count: { select: { users: true, nurses: true } } },
      }),
      isSuper
        ? this.prisma.organization.findMany({
            include: {
              _count: { select: { departments: true, nurses: true, users: true } },
            },
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve([]),
    ]);

    // Calcular cobertura para hoy
    const scheduleEntriesByStatusToday = await this.prisma.scheduleEntry.groupBy({
      by: ['status'],
      where: {
        ...scheduleEntryFilter,
        date: { gte: startOfToday, lte: endOfToday },
      },
      _count: { _all: true },
    });

    const statusCountsToday: Record<string, number> = {};
    for (const row of scheduleEntriesByStatusToday) {
      statusCountsToday[row.status] = row._count._all;
    }

    const coveredToday = (statusCountsToday['ASSIGNED'] || 0) + (statusCountsToday['CONFIRMED'] || 0);
    const openToday = statusCountsToday['OPEN'] || 0;
    const totalToday = scheduleEntriesToday || 1;
    const coveragePercent = Math.round((coveredToday / totalToday) * 100);

    // Alertas recientes
    const recentAlerts = await this.prisma.operationalAlert.findMany({
      where: {
        status: { in: ['OPEN', 'IN_PROGRESS', 'ESCALATED'] },
        ...(orgFilter.organizationId ? { department: { organizationId: orgFilter.organizationId } } : {}),
        ...(filters?.departmentId ? { departmentId: filters.departmentId } : {}),
      },
      take: 10,
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      include: { department: { select: { name: true, organizationId: true } } },
    });

    return {
      user: {
        id: user.id,
        role: user.role,
        organizationId: user.organizationId,
        name: user.name || user.firstName,
      },
      overview: {
        totalOrganizations: isSuper ? totalOrganizations : (orgFilter.organizationId ? 1 : 0),
        activeOrganizations: isSuper ? activeOrganizations : (orgFilter.organizationId ? 1 : 0),
        totalDepartments,
        totalNurses,
        activeNurses,
        totalUsers,
        scheduleEntriesToday,
        coverageToday: coveredToday,
        openToday,
        coveragePercent,
        openAlerts,
        criticalAlerts,
        pendingAbsences,
        activeVacations: approvedVacations,
      },
      todaySchedule: recentScheduleEntries,
      recentAlerts,
      recentActivity: activityLogs,
      departments: departmentsList.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        nursesCount: (d as any)._count?.nurses || 0,
        usersCount: (d as any)._count?.users || 0,
      })),
      organizations: isSuper
        ? organizationsList.map((o: any) => ({
            id: o.id,
            name: o.name,
            code: o.code,
            status: o.status,
            departmentsCount: o._count?.departments || 0,
            nursesCount: o._count?.nurses || 0,
            usersCount: o._count?.users || 0,
          }))
        : [],
      statusCountsToday,
      generatedAt: new Date().toISOString(),
    };
  }
}
