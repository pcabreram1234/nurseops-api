// 📄 schedule-version.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class ScheduleVersionService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Crea un respaldo histórico inmutable (Snapshot JSON) del estado actual de un calendario.
   * * @param scheduleId Identificador único del horario maestro.
   * @param tx Instancia opcional de una transacción de Prisma ($transaction).
   */
  async createSnapshot(scheduleId: string, tx?: Prisma.TransactionClient) {
    // 🟢 Flexibilidad: Si viene dentro de una transacción usamos 'tx', de lo contrario usamos la instancia global 'this.prisma'
    const db = tx || this.prisma;

    /*
    |--------------------------------------------------------------------------
    | 1. ENCONTRAR HORARIO CON SU RELACIÓN CORRECTA ('entries')
    |--------------------------------------------------------------------------
    */
    const schedule = await db.schedule.findUnique({
      where: {
        id: scheduleId,
      },
      include: {
        // 🟢 Corregido según tu schema.prisma: la relación se llama 'entries'
        scheduleEntries: {
          include: {
            shift: true,
            shiftTemplate: true,
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(`The snapshot could not be generated. The schedule with ID ${scheduleId} does not exist.`);
    }

    /*
    |--------------------------------------------------------------------------
    | 2. CALCULAR EL NÚMERO DE LA SIGUIENTE VERSIÓN
    |--------------------------------------------------------------------------
    */
    const latestVersion = await db.scheduleVersion.findFirst({
      where: {
        scheduleId,
      },
      orderBy: {
        version: "desc",
      },
    });

    const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

    /*
    |--------------------------------------------------------------------------
    | 3. PERSISTIR SNAPSHOT EN LA TABLA DE VERSIONES
    |--------------------------------------------------------------------------
    | Guardamos la estructura del objeto completo como un snapshot JSON inmutable.
    */
    return await db.scheduleVersion.create({
      data: {
        scheduleId,
        version: nextVersion,
        // Convertimos explícitamente a JsonValue para satisfacer el tipado estricto de Prisma
        snapshot: schedule as unknown as Prisma.JsonValue || {},
      },
    });
  }
}