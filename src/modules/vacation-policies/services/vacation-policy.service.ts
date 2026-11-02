import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";

import { VacationCycleType, VacationPolicyRule } from "@prisma/client";
import { AssignVacationPolicyDto, SimulateVacationDto } from "../dto";
import { VacationBalanceService } from "./vacation-balance.service";

@Injectable()
export class VacationPolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly balanceService: VacationBalanceService,
  ) {}

  async findAll(user: any) {
    const organizationId = user?.organizationId;
    if (!organizationId) {
      throw new BadRequestException("Organization ID is required");
    }

    return this.prisma.vacationPolicy.findMany({
      where: { organizationId },
      include: { rules: true },
      orderBy: { version: "desc" },
    });
  }

  async findOne(id: string, user: any) {
    const organizationId = user?.organizationId;
    if (!organizationId) {
      throw new BadRequestException("Organization ID is required");
    }

    const policy = await this.prisma.vacationPolicy.findFirst({
      where: { id, organizationId },
      include: { rules: true, profiles: true },
    });

    if (!policy) {
      throw new NotFoundException("Vacation policy not found");
    }

    return policy;
  }

  async create(dto: any, user: any) {
    const organizationId = user.organizationId;

    // Verificar si ya existe una política con el mismo código
    const existing = await this.prisma.vacationPolicy.findFirst({
      where: { organizationId, code: dto.code },
    });

    if (existing) {
      throw new BadRequestException("Ya existe una política con ese código");
    }

    const { rules = [], status: _status, ...policyData } = dto;

    return this.prisma.vacationPolicy.create({
      data: {
        ...policyData,
        // Normalizar fechas (los DTO aceptan YYYY-MM-DD; Prisma exige DateTime)
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
        // Toda política nace como DRAFT; la activación exige validación de RR.HH.
        status: "DRAFT",
        organization: { connect: { id: organizationId } },
        rules: {
          create: rules.map((rule: any) => ({
            name: rule.name,
            priority: rule.priority,
            seniorityFromMonths: rule.seniorityFromMonths,
            seniorityToMonths: rule.seniorityToMonths,
            daysGranted: rule.daysGranted,
            accrualMethod: rule.accrualMethod,
            contractTypes: rule.contractTypes,
            employeeCategoryCode: rule.employeeCategoryCode,
            minWeeklyHours: rule.minWeeklyHours,
            effectiveFrom: rule.effectiveFrom ? new Date(rule.effectiveFrom) : undefined,
            effectiveTo: rule.effectiveTo ? new Date(rule.effectiveTo) : undefined,
            isActive: rule.isActive,
            conditions: rule.conditions,
          })),
        },
      },
      include: { rules: true },
    });
  }

  async update(id: string, dto: any, user: any) {
    const organizationId = user.organizationId;

    const policy = await this.prisma.vacationPolicy.findFirst({
      where: { id, organizationId },
    });

    if (!policy) {
      throw new NotFoundException("Vacation policy not found");
    }

    // Si se está intentando activar una política en uso, validar
    if (dto.status === "ACTIVE" && policy.status === "ACTIVE") {
      // Verificar si hay perfiles o vacaciones asociadas
      const count = await this.prisma.nurseVacationProfile.count({
        where: { policyId: id, isActive: true },
      });

      if (count > 0) {
        throw new BadRequestException(
          "No se puede activar la política porque ya tiene perfiles de enfermeras asignados",
        );
      }
    }

    return this.prisma.vacationPolicy.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.effectiveFrom && { effectiveFrom: new Date(dto.effectiveFrom) }),
        ...(dto.effectiveTo && { effectiveTo: new Date(dto.effectiveTo) }),
        ...(dto.rules && {
          rules: {
            deleteMany: {},
            create: dto.rules.map((rule: any) => ({
              name: rule.name,
              priority: rule.priority,
              seniorityFromMonths: rule.seniorityFromMonths,
              seniorityToMonths: rule.seniorityToMonths,
              daysGranted: rule.daysGranted,
              accrualMethod: rule.accrualMethod,
              contractTypes: rule.contractTypes,
              employeeCategoryCode: rule.employeeCategoryCode,
              minWeeklyHours: rule.minWeeklyHours,
              isActive: rule.isActive,
              conditions: rule.conditions,
            })),
          },
        }),
      },
      include: { rules: true },
    });
  }

  async activate(id: string, user: any) {
    const organizationId = user.organizationId;

    const policy = await this.prisma.vacationPolicy.findFirst({
      where: { id, organizationId },
      include: { profiles: true },
    });

    if (!policy) {
      throw new NotFoundException("Vacation policy not found");
    }

    if (policy.status === "ACTIVE") {
      throw new BadRequestException("La política ya está activa");
    }

    // Validar que no haya perfiles activos antes de activar
    if (policy.profiles.length > 0) {
      const activeProfiles = policy.profiles.filter((p) => p.isActive);
      if (activeProfiles.length > 0) {
        throw new BadRequestException(
          "No se puede activar la política porque tiene perfiles activos. Archive o reasigne los perfiles primero.",
        );
      }
    }

    return this.prisma.vacationPolicy.update({
      where: { id },
      data: { status: "ACTIVE", approvedById: user.sub, approvedAt: new Date() },
    });
  }

  async assignToNurse(dto: AssignVacationPolicyDto, user: any) {
    const organizationId = user.organizationId;

    if (!dto.policyId) {
      throw new BadRequestException("El identificador de la política es requerido");
    }
    const policyId = dto.policyId;

    // Verificar que la política existe y está activa
    const policy = await this.prisma.vacationPolicy.findFirst({
      where: { id: policyId, organizationId, status: "ACTIVE" },
      include: { rules: true },
    });

    if (!policy) {
      throw new NotFoundException("Política no encontrada o no activa");
    }

    // Verificar que la enfermera existe
    const nurse = await this.prisma.nurse.findUnique({
      where: { id: dto.nurseId },
    });

    if (!nurse) {
      throw new NotFoundException("Enfermera no encontrada");
    }

    // Verificar si ya tiene una política asignada vigente
    const existingProfile = await this.prisma.nurseVacationProfile.findFirst({
      where: {
        nurseId: dto.nurseId,
        policyId: dto.policyId,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } },
        ],
        isActive: true,
      },
    });

    if (existingProfile) {
      throw new BadRequestException(
        "La enfermera ya tiene una política vigente. Modifique la política existente o archive la anterior.",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.nurseVacationProfile.create({
        data: {
          organizationId,
          nurseId: dto.nurseId,
          policyId,
          regimeCode: policy.regimeCode,
          employeeCategoryCode:
            policy.rules.find((r) => r.isActive)?.employeeCategoryCode ?? null,
          contractType: policy.rules.find((r) => r.isActive)?.contractTypes?.[0] || nurse.contract_type,
          hireDate: nurse.hire_date,
          recognizedSeniorityDate: nurse.hire_date, // Por defecto, usar fecha de contratación
          effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
          effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
          isActive: dto.isActive ?? true,
          assignedById: user.sub,
          notes: "Asignación automática desde política de vacaciones",
        },
        include: { policy: true },
      });

      // Crear el balance del período vigente (con devengo inicial si aplica)
      await this.balanceService.ensureOpenBalance(profile, policy, tx);

      return profile;
    });
  }

  async simulate(dto: SimulateVacationDto, user: any) {
    const organizationId = user.organizationId;

    // Obtener el perfil de la enfermera
    const profile = await this.prisma.nurseVacationProfile.findFirst({
      where: {
        nurseId: dto.nurseId,
        isActive: true,
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } },
        ],
      },
      include: { policy: { include: { rules: true } } },
    });

    if (!profile) {
      throw new NotFoundException("No hay perfil de vacaciones para esta enfermera");
    }

    // Obtener la regla aplicable basándose en la antigüedad
    const seniorityMonths = this.calculateSeniorityMonths(
      profile.hireDate,
      profile.recognizedSeniorityDate,
    );

    const applicableRule = profile.policy.rules.find((rule) => {
      if (!rule.isActive) return false;
      if (seniorityMonths < rule.seniorityFromMonths) return false;
      if (rule.seniorityToMonths && seniorityMonths > rule.seniorityToMonths) return false;
      return true;
    });

    if (!applicableRule) {
      throw new BadRequestException(
        "No hay regla aplicable para la antigüedad de esta enfermera",
      );
    }

    // Calcular el período
    const periodStart = new Date();
    const periodEnd = this.getPeriodEnd(profile.policy.cycleType, periodStart);

    // Simular el cálculo
    const calculatedDays = applicableRule.daysGranted;

    return {
      policy: {
        id: profile.policy.id,
        name: profile.policy.name,
        version: profile.policy.version,
      },
      rule: applicableRule,
      seniorityMonths,
      period: { start: periodStart, end: periodEnd },
      calculatedDays,
      proration: 1,
      accruedDays: calculatedDays,
      carriedInDays: 0,
      usedDays: 0,
      reservedDays: 0,
      availableDays: calculatedDays,
      explanation: this.getCalculationExplanation(applicableRule, seniorityMonths),
    };
  }

  private calculateSeniorityMonths(hireDate: Date, recognizedSeniorityDate: Date): number {
    const start = recognizedSeniorityDate || hireDate;
    const today = new Date();
    const months = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
    return Math.max(0, months);
  }

  private getPeriodEnd(cycleType: VacationCycleType, startDate: Date): Date {
    const end = new Date(startDate);

    switch (cycleType) {
      case VacationCycleType.CALENDAR_YEAR:
        end.setFullYear(end.getFullYear() + 1);
        end.setMonth(11, 31); // 31 de diciembre
        break;
      case VacationCycleType.ANNIVERSARY:
        // Aniversario: mismo día del próximo año
        const nextYear = end.getFullYear() + 1;
        end.setFullYear(nextYear);
        end.setMonth(startDate.getMonth(), startDate.getDate());
        break;
      case VacationCycleType.FISCAL_YEAR:
        // Año fiscal (asumiendo que empieza en octubre)
        end.setFullYear(end.getFullYear() + 1);
        end.setMonth(9, 30); // 30 de septiembre
        break;
      default:
        end.setFullYear(end.getFullYear() + 1);
    }

    return end;
  }

  private getCalculationExplanation(rule: VacationPolicyRule, seniorityMonths: number): string[] {
    const explanations: string[] = [];

    explanations.push(
      `Regla aplicada: ${rule.name}`,
    );

    explanations.push(
      `Antigüedad: ${seniorityMonths} meses (desde ${seniorityMonths < 12 ? `${seniorityMonths} mes` : `${Math.floor(seniorityMonths / 12)} años ${seniorityMonths % 12} meses`})`,
    );

    explanations.push(
      `Días otorgados: ${rule.daysGranted} ${rule.accrualMethod}`,
    );

    if (rule.seniorityToMonths) {
      explanations.push(
        `Rango de antigüedad: ${rule.seniorityFromMonths}-${rule.seniorityToMonths} meses`,
      );
    } else {
      explanations.push(
        `Rango de antigüedad: ${rule.seniorityFromMonths}+ meses`,
      );
    }

    return explanations;
  }
}