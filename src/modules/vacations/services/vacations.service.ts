import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

import {
  Prisma,
  VacationStatus,
  VacationTransactionType,
  AbsenceType,
  AbsenceSource,
} from "@prisma/client";

import { ApproveVacationDto } from "../dto";
import { VacationBalanceService } from "../../vacation-policies/services/vacation-balance.service";

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

@Injectable()
export class VacationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly balanceService: VacationBalanceService,
  ) {}

  async create(dto: any, user: any) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException("End date cannot be before start date");
    }

    const {
      startDate: _s,
      endDate: _e,
      notes,
      reason,
      nurseId,
      branchId: requestedBranchId,
      ...rest
    } = dto;

    const nurse = await this.prisma.nurse.findUnique({
      where: { id: nurseId },
      select: { departmentId: true },
    });

    if (!nurse) {
      throw new BadRequestException("The selected nurse does not exist.");
    }

    let branchId: string | null = requestedBranchId ?? null;
    if (branchId) {
      await this.assertBranchInOrganization(branchId, user.organizationId);
    } else {
      branchId = await this.resolveNurseBranch(nurseId, user.organizationId);
    }

    // Días naturales de la ausencia (inclusivo). El cómputo definitivo según
    // el dayBasis de la política (calendario/laborables/turnos) se refina al
    // momento de aprobar con la política asignada a la enfermera.
    const absenceDays = this.calculateDaysInclusive(startDate, endDate);

    return this.prisma.vacation.create({
      data: {
        ...rest,
        reason: reason ?? "",
        notes: notes ?? "",
        startDate,
        endDate,
        status: dto.status || "DRAFT",
        requestedDays: dto.requestedDays ?? absenceDays,
        chargedDays: dto.requestedDays ?? absenceDays,
        absenceDays,
        payrollDays: dto.requestedDays ?? absenceDays,
        department: { connect: { id: nurse.departmentId } },
        nurse: { connect: { id: nurseId } },
        organization: { connect: { id: user.organizationId } },
        ...(branchId ? { branch: { connect: { id: branchId } } } : {}),
      },
      include: {
        nurse: { include: { user: true, branch: true } },
        department: true,
        branch: true,
      },
    });
  }

  async findAll(query: any, user: any) {
    const where: Prisma.VacationWhereInput = {
      organizationId: user.organizationId,
      ...(query.nurseId && { nurseId: query.nurseId }),
      ...(query.branchId && { branchId: query.branchId }),
      ...(query.departmentId && { departmentId: query.departmentId }),
      ...(query.status && { status: query.status }),
      ...(query.startDate && { startDate: { gte: new Date(query.startDate) } }),
      ...(query.endDate && { endDate: { lte: new Date(query.endDate) } }),
    };

    const include = {
      nurse: { include: { user: true, branch: true } },
      department: true,
      approvedBy: true,
      branch: true,
      absence: true,
    };

    const orderBy = { createdAt: "desc" as const };

    if (query.page || query.limit) {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(500, Math.max(1, Number(query.limit) || 25));
      const [data, total] = await Promise.all([
        this.prisma.vacation.findMany({
          where,
          include,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.vacation.count({ where }),
      ]);
      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    return this.prisma.vacation.findMany({
      where,
      include,
      orderBy,
    });
  }

  async findOne(id: string, user: any) {
    const vacation = await this.prisma.vacation.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        nurse: true,
        approvedBy: true,
        department: true,
        branch: true,
        absence: true,
      },
    });

    if (!vacation) {
      throw new NotFoundException("Vacation not found");
    }

    return vacation;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);

    const { startDate, endDate, ...rest } = dto;

    let departmentId: string | undefined;
    if (dto.nurseId) {
      const nurse = await this.prisma.nurse.findUnique({
        where: { id: dto.nurseId },
        select: { departmentId: true },
      });
      if (!nurse) {
        throw new BadRequestException("The selected nurse does not exist.");
      }
      departmentId = nurse.departmentId;
    }

    if (dto.branchId) {
      await this.assertBranchInOrganization(dto.branchId, user.organizationId);
    }

    const data: Prisma.VacationUncheckedUpdateInput = {
      ...rest,
      ...(departmentId ? { departmentId } : {}),
      ...(startDate ? { startDate: new Date(startDate) } : {}),
      ...(endDate ? { endDate: new Date(endDate) } : {}),
    };

    // Recalcular días si cambiaron las fechas
    if (startDate || endDate) {
      const current = await this.prisma.vacation.findUniqueOrThrow({
        where: { id },
        select: { startDate: true, endDate: true },
      });
      const newStart = startDate ? new Date(startDate) : current.startDate;
      const newEnd = endDate ? new Date(endDate) : current.endDate;

      if (newEnd < newStart) {
        throw new BadRequestException("End date cannot be before start date");
      }

      const absenceDays = this.calculateDaysInclusive(newStart, newEnd);
      data.absenceDays = absenceDays;
      data.requestedDays = absenceDays;
      data.chargedDays = absenceDays;
      data.payrollDays = absenceDays;
    }

    return this.prisma.vacation.update({
      where: { id },
      data,
      include: {
        nurse: { include: { user: true, branch: true } },
        department: true,
        branch: true,
      },
    });
  }

  /**
   * Aprueba o rechaza una solicitud de vacaciones.
   *
   * Al aprobar:
   *  1. Reserva los días que descuentan saldo (chargedDays) en el balance abierto.
   *  2. Registra la transacción RESERVATION en el ledger (idempotente).
   *  3. Crea la Absence vinculada (fuente única de indisponibilidad del planificador).
   */
  async approve(id: string, dto: ApproveVacationDto, user: any) {
    const vacation = await this.findOne(id, user);

    if (vacation.status === VacationStatus.APPROVED) {
      throw new BadRequestException("This vacation request is already approved");
    }

    if (dto.status === VacationStatus.REJECTED) {
      const rejected = await this.prisma.vacation.update({
        where: { id },
        data: {
          status: VacationStatus.REJECTED,
          approvedById: user.sub,
          approvedAt: new Date(),
          rejectionReason: dto.rejectionReason ?? null,
          ...(dto.notes ? { notes: dto.notes } : {}),
        },
        include: {
          nurse: { include: { user: true, branch: true } },
          approvedBy: true,
        },
      });

      return {
        vacation: rejected,
        absence: null,
        message: "Vacación rechazada",
      };
    }

    if (dto.status !== VacationStatus.APPROVED) {
      throw new BadRequestException("Status must be APPROVED or REJECTED");
    }

    return this.prisma.$transaction(async (tx) => {
      const full = await tx.vacation.findUniqueOrThrow({
        where: { id },
        include: {
          nurse: {
            include: {
              nurseVacationProfiles: { include: { balances: true } },
            },
          },
        },
      });

      const charged = Number(full.chargedDays ?? full.requestedDays ?? 0);
      if (charged <= 0) {
        throw new BadRequestException("Los días a descontar deben ser mayores a 0");
      }

      const profile = full.nurse.nurseVacationProfiles.find(
        (p) => p.isActive && (!p.effectiveTo || p.effectiveTo >= new Date()),
      );

      if (!profile) {
        throw new BadRequestException(
          "La enfermera no tiene un perfil de vacaciones activo",
        );
      }

      // Garantizar el balance del período vigente (se crea con devengo inicial si no existe)
      const policy = await tx.vacationPolicy.findUniqueOrThrow({
        where: { id: profile.policyId },
        include: { rules: true },
      });
      const { balanceId } = await this.balanceService.ensureOpenBalance(profile, policy, tx);

      const balance = await tx.vacationBalance.findUniqueOrThrow({
        where: { id: balanceId },
      });

      if (Number(balance.availableDays) < charged) {
        throw new BadRequestException("Saldo insuficiente");
      }

      // Reservar saldo (control optimista por campo version)
      await tx.vacationBalance.update({
        where: { id: balance.id },
        data: {
          reservedDays: { increment: charged },
          availableDays: { decrement: charged },
          version: { increment: 1 },
        },
      });

      // Ledger idempotente: reintentos no duplican la reserva
      const reservationKey = `RESERVATION:${id}`;
      const existingTx = await tx.vacationTransaction.findUnique({
        where: { idempotencyKey: reservationKey },
      });

      if (!existingTx) {
        await tx.vacationTransaction.create({
          data: {
            organizationId: full.organizationId,
            balanceId: balance.id,
            vacationId: full.id,
            type: VacationTransactionType.RESERVATION,
            days: charged,
            effectiveDate: full.startDate,
            reason: "Reserva por solicitud de vacaciones aprobada",
            idempotencyKey: reservationKey,
            balanceAfter: {
              accruedDays: Number(balance.accruedDays),
              usedDays: Number(balance.usedDays),
              reservedDays: Number(balance.reservedDays) + charged,
              availableDays: Number(balance.availableDays) - charged,
              version: balance.version + 1,
            },
            createdById: user.sub,
          },
        });
      }

      // Crear ausencia vinculada (fuente única de indisponibilidad)
      const absence = await tx.absence.create({
        data: {
          nurseId: full.nurseId,
          organizationId: full.organizationId,
          date: full.startDate,
          endDate: full.endDate,
          type: AbsenceType.VACATION,
          status: "APPROVED",
          reason: full.reason || "Vacaciones aprobadas",
          reporterById: user.sub,
          requiresCoverage: true,
          vacationId: full.id,
          source: AbsenceSource.VACATION_REQUEST,
        },
        include: {
          nurse: true,
          reporter: true,
          branch: true,
        },
      });

      // Actualizar estado de la solicitud
      const updatedVacation = await tx.vacation.update({
        where: { id },
        data: {
          status: VacationStatus.APPROVED,
          approvedById: user.sub,
          approvedAt: new Date(),
          chargedDays: charged,
          ...(dto.notes ? { notes: dto.notes } : {}),
        },
        include: {
          nurse: { include: { user: true, branch: true } },
          approvedBy: true,
        },
      });

      return {
        vacation: updatedVacation,
        absence,
        message: "Vacación aprobada exitosamente",
      };
    });
  }

  /**
   * Cancela una solicitud: libera la reserva de saldo, registra
   * RESERVATION_RELEASE en el ledger y cancela la ausencia vinculada.
   */
  async remove(id: string, user: any) {
    await this.findOne(id, user);

    return this.prisma.$transaction(async (tx) => {
      const vacation = await tx.vacation.findUniqueOrThrow({
        where: { id },
        include: {
          nurse: {
            include: {
              nurseVacationProfiles: { include: { balances: true } },
            },
          },
          absence: true,
        },
      });

      // Cancelar ausencia vinculada si existe y sigue activa
      if (
        vacation.absence &&
        vacation.absence.status !== "CANCELLED" &&
        vacation.absence.status !== "REJECTED"
      ) {
        await tx.absence.update({
          where: { id: vacation.absence.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
          },
        });
      }

      // Liberar reserva de saldo solo si existe la reserva original (idempotente)
      const reservationKey = `RESERVATION:${id}`;
      const releaseKey = `RESERVATION_RELEASE:${id}`;
      const reservation = await tx.vacationTransaction.findUnique({
        where: { idempotencyKey: reservationKey },
      });
      const release = await tx.vacationTransaction.findUnique({
        where: { idempotencyKey: releaseKey },
      });

      if (reservation && !release) {
        const profile = vacation.nurse.nurseVacationProfiles.find(
          (p) => p.isActive,
        );
        const balance =
          profile?.balances.find((b) => !b.closedAt) ??
          vacation.nurse.nurseVacationProfiles
            .flatMap((p) => p.balances)
            .find((b) => b.id === reservation.balanceId);

        if (balance) {
          const charged = Number(reservation.days);

          await tx.vacationBalance.update({
            where: { id: balance.id },
            data: {
              reservedDays: { decrement: charged },
              availableDays: { increment: charged },
              version: { increment: 1 },
            },
          });

          await tx.vacationTransaction.create({
            data: {
              organizationId: vacation.organizationId,
              balanceId: balance.id,
              vacationId: vacation.id,
              type: VacationTransactionType.RESERVATION_RELEASE,
              days: charged,
              effectiveDate: new Date(),
              reason: "Liberación de reserva por cancelación de solicitud",
              idempotencyKey: releaseKey,
              balanceAfter: {
                reservedDays: Number(balance.reservedDays) - charged,
                availableDays: Number(balance.availableDays) + charged,
                version: balance.version + 1,
              },
              createdById: user.sub,
            },
          });
        }
      }

      await tx.vacation.delete({
        where: { id },
      });

      return { message: "Solicitud de vacaciones cancelada" };
    });
  }

  private async assertBranchInOrganization(
    branchId: string,
    organizationId: string,
  ): Promise<void> {
    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, organizationId },
      select: { id: true },
    });

    if (!branch) {
      throw new BadRequestException(
        "The selected branch does not belong to your organization.",
      );
    }
  }

  private async resolveNurseBranch(
    nurseId: string,
    organizationId: string,
  ): Promise<string | null> {
    const nurse = await this.prisma.nurse.findUnique({
      where: { id: nurseId },
      select: { organizationId: true, branchId: true },
    });

    if (!nurse || nurse.organizationId !== organizationId) {
      return null;
    }

    return nurse.branchId ?? null;
  }

  /**
   * Días naturales de la ausencia (inclusivo, ambos extremos cuentan).
   */
  private calculateDaysInclusive(start: Date, end: Date): number {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    return Math.round((utcEnd - utcStart) / MS_PER_DAY) + 1;
  }
}
