import { PrismaClient, DepartmentType } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PERMISSIONS } from "../src/modules/permissions/constants/permissions.constants";
import * as dotenv from "dotenv";
import { randomUUID, } from "node:crypto";

dotenv.config();

// Configuración obligatoria del adaptador para Prisma 7
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando la inserción de datos de prueba...");

  // 1. Crear Organización Principal
  const organization = await prisma.organization.create({
    data: {
      name: "Hospital General Central",
      code: "HGC-2026",
      timezone: "America/Santo_Domingo",
      country: "República Dominicana",
      status: "A",
    },
  });
  console.log(`✅ Organización creada: ${organization.name}`);

  // 2. Crear Configuración de Organización (Relación 1:1 obligatoria)
  await prisma.organizationSetting.create({
    data: {
      organizationId: organization.id,
      birthday_free_day_enabled: true,
      max_monthly_hours: 160,
      require_shift_approval: true,
      auto_balance_nights: true,
      allow_cross_department: false,
      allow_overtime: true,
    },
  });

  // 3. Crear una Sucursal (Branch)
  const branch = await prisma.branch.create({
    data: {
      organizationId: organization.id,
      name: "Ala Norte - Urgencias",
      address: "Av. Metropolitana #450",
      city: "Santo Domingo",
      state: "Distrito Nacional",
      country: "República Dominicana",
      zipCode: "10101",
      phone: "+1-809-555-0101",
      email: "clinica@hotmail.com"
    }
  });

  // 4. Crear un Departamento vinculado a la Sucursal
  const department = await prisma.department.create({
    data: {
      organizationId: organization.id,
      branchId: branch.id,
      name: "Unidad de Cuidados Intensivos (UCI)",
      type: DepartmentType.ICU,
      minimum_staff: 3,
      criticalLevel: "HIGH",
      code: "UCI-001",
      description: "Departamento de cuidados intensivos para pacientes críticos.",
      maxCapacity: 20,
      allowOvertime: true,
    },
  });

  // 5. Crear Roles de Usuario
  const adminRole = await prisma.roles.create({
    data: {
      name: "SUPERVISOR",
      organizationId: organization.id,
    },
  });

  const nurseRole = await prisma.roles.create({
    data: {
      name: "NURSE",
      organizationId: organization.id,
    },
  });

  // 6. Crear Usuarios (Supervisor y Enfermero)
  // Nota: En producción las contraseñas deben estar encriptadas con bcrypt
  const superUser = await prisma.user.create({
    data: {
      email: "pcabreram1234@gmail.com",
      password: "$2b$10$7Z2NqQYm8P8N4p4jK2NGeexl9qYj5n3rT6vV9XbZQ1M9u7W3Y4X5C", //8998414
      firstName: "Phillip",
      lastName: "Cabrera",
      organizationId: organization.id,
      departmentId: department.id,
      rolesId: adminRole.id,
      status: "ACTIVE",
      refreshToken: "",
      lastLoginAt: new Date(),
      auditLogId: randomUUID()
    },
  });

  const nurseUser = await prisma.user.create({
    data: {
      email: "enfermero.prueba@hospital.com",
      password: "PasswordSeguro123!",
      firstName: "Carlos",
      lastName: "Peralta",
      organizationId: organization.id,
      departmentId: department.id,
      rolesId: nurseRole.id,
      status: "ACTIVE",
      refreshToken: "",
      lastLoginAt: new Date(),
      auditLogId: randomUUID(),
    },
  });
  console.log("✅ Usuarios de prueba creados.");

  // 7. Crear Especialidad médica
  const speciality = await prisma.speciality.create({
    data: {
      name: "Cuidados Críticos Adultos",
      code: "SP-CRIT-001",
      organizationId: organization.id,
      description:
        "Especialidad enfocada en la estabilización de pacientes en estado crítico.",
    },
  });

  // Asociar especialidad al departamento (Tabla intermedia de tu relación N:M)
  await prisma.departmentSpeciality.create({
    data: {
      departmentId: department.id,
      specialityId: speciality.id,
    },
  });

  // 8. Crear Perfil de Enfermero vinculado al Usuario
  const nurseProfile = await prisma.nurse.create({
    data: {
      userId: nurseUser.id,
      organizationId: organization.id,
      departmentId: department.id,
      contract_type: "PERMANENT",
      hire_date: new Date("2024-01-15"),
      status: "ACTIVE",
      specialityId: speciality.id,
    },
  });

  // Preferencias del enfermero
  await prisma.nursePreferences.create({
    data: {
      nurseId: nurseProfile.id,
      organizationId: organization.id,
    },
  });

  // 9. Insertar un Turno (Shift) de muestra
  const shift = await prisma.shift.create({
    data: {
      organizationId: organization.id,
      departmentId: department.id,
      name: "Morning Shift",
      code: "MSHIFT",
      type: "MORNING",
      startTime: new Date("2026-06-01T07:00:00Z"),
      endTime: new Date("2026-06-01T15:00:00Z"),
      durationHours: 10, // Objeto DateTime como pide tu modelo
      color: "#3498db",
    },
  });

  // 10. Insertar una Solicitud de cambio de turno de ejemplo
  await prisma.shiftChangeRequest.create({
    data: {
      status: "AWAITING_OTHER_NURSE",
      organizationId: organization.id,
      requesterId: nurseUser.id,
      sourceShiftId: shift.id,
      reason: "Cita médica familiar por la mañana",
    },
  });

  /*
  |--------------------------------------------------------------------------
  | EJEMPLO: CREACIÓN DE ROLES POR DEFECTO PARA UNA ORGANIZACIÓN DE PRUEBA
  |--------------------------------------------------------------------------
  */
  // Si tienes una organización base, aquí puedes mapear los arreglos automáticos de permisos
  // para los roles de 'SUPERVISOR' y 'ENFERMERO' usando tx.rolePermissions.createMany

  console.log("🌱 Iniciando la siembra de Permisos Base...");

  // 1. Aplanar el objeto de constantes para obtener una lista limpia de strings (Códigos)
  const permissionCodes: string[] = [];

  for (const category of Object.values(PERMISSIONS)) {
    for (const code of Object.values(category)) {
      permissionCodes.push(code);
    }
  }

  // 2. Insertar o actualizar todos los permisos usando el campo 'code' como clave de búsqueda único
  const upsertPermissionsPromises = permissionCodes.map((code) => {
    // Generar una descripción amigable automatizada basada en el código
    const description = `Permite realizar la acción de ${code.toLowerCase().replace(/_/g, " ")}`;

    return prisma.permission.upsert({
      // 🔒 Buscamos por el campo único 'code'.
      // Si existe, no creará un duplicado ni alterará el UUID ya existente.
      where: {
        name: code,
      },
      // Si el permiso ya existe, podemos actualizar la descripción (útil si la cambias en el futuro)
      update: {
        description: description,
      },
      // Si no existe, Prisma autogenerará el 'id' (UUID) gracias al @default(uuid()) de tu schema
      create: {
        name: code,
        description: description,
      },
    });
  });

  // Ejecutamos de forma paralela y esperamos a que todas terminen
  await Promise.all(upsertPermissionsPromises);

  console.log(
    `✅ ${permissionCodes.length} Permisos sincronizados con éxito en la Base de Datos.`,
  );
}

console.log("🌱 ¡Proceso de Seed completado con éxito!");

main()
  .catch((e) => {
    console.error("❌ Error ejecutando el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Cerramos el pool de conexiones al terminar
    await pool.end();
  });
