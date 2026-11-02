import { PrismaClient, WorkRuleTypes } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PERMISSIONS } from "../src/modules/permissions/constants/permissions.constants";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * ============================================================================
 * SEED IDEMPOTENTE — NurseOps API
 * ============================================================================
 *
 * Port de `prisma/DummyData.sql` a Prisma, adaptado al schema vigente de la
 * base de datos y seguro para ejecutarse infinitas veces (upserts).
 *
 * - Usa los IDs fijos de DummyData.sql para que las relaciones sean estables.
 * - Cada registro se inserta con `upsert` usando su clave natural única
 *   (email, code, name, composite) o su ID cuando no hay clave natural.
 * - Puede ejecutarse sobre una BD vacía (migraciones aplicadas) o sobre una
 *   BD ya sembrada: siempre converge al mismo estado.
 * - NO toca datos de runtime (schedules, alerts, logs) ni registros creados
 *   manualmente que no formen parte del dataset.
 *
 * Ejecutar con:  bun run prisma/seed.ts   |   npx prisma db seed
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================================
// CONSTANTES
// ============================================================================

const ORG_ID = "e3772e1f-17b5-47e6-b0c5-077d0432f7ca";
const CRON_BOT_USER_ID = "00000000-0000-0000-0000-000000000000"; // SYSTEM_BOT_USER_ID del .env
const DEFAULT_PASSWORD_HASH =
  "$2a$12$GudKEXW2CAlv2bqO7KnHauAGCLIP/bz8ZSqL56NEbMxKHZgxW0CY6";

/**
 * Convierte 'YYYY-MM-DD HH:mm:ss' (naive, como en DummyData.sql) a un Date UTC
 * determinista. Evita que la zona horaria local del servidor corrompa las horas.
 */
const d = (naive: string) => new Date(`${naive.replace(" ", "T")}Z`);

// ============================================================================
// 1. CONFIGURACIONES GLOBALES (SystemConfiguration y FeatureFlag)
// ============================================================================

const SYSTEM_CONFIGURATIONS = [
  { id: "sys-01", key: "MAX_MONTHLY_HOURS", value: "160" },
  { id: "sys-02", key: "MIN_REST_HOURS", value: "12" },
  { id: "sys-03", key: "ALLOW_DOUBLE_SHIFT", value: "false" },
  { id: "sys-04", key: "DEFAULT_SHIFT_DURATION", value: "8" },
  { id: "sys-05", key: "ENABLE_BIRTHDAY_DAY_OFF", value: "true" },
  { id: "sys-06", key: "AUTO_APPROVE_SHIFT_CHANGES", value: "false" },
  { id: "sys-07", key: "MAX_CONSECUTIVE_NIGHTS", value: "3" },
  { id: "sys-08", key: "OVERTIME_LIMIT", value: "20" },
  { id: "sys-09", key: "FATIGUE_ALERT_THRESHOLD", value: "85" },
  { id: "sys-10", key: "EMERGENCY_COVERAGE_BONUS", value: "true" },
] as const;

const FEATURE_FLAGS = [
  { id: "ff-01", feature_name: "AUTO_SCHEDULING", isActive: true },
  { id: "ff-02", feature_name: "SHIFT_SWAP_AUTOMATION", isActive: true },
  { id: "ff-03", feature_name: "AI_FATIGUE_ANALYSIS", isActive: true },
  { id: "ff-04", feature_name: "WHATSAPP_NOTIFICATIONS", isActive: true },
  { id: "ff-05", feature_name: "EMERGENCY__AI", isActive: false },
  { id: "ff-06", feature_name: "DARK_MODE", isActive: true },
  { id: "ff-07", feature_name: "MULTI_BRANCH_SUPPORT", isActive: true },
  { id: "ff-08", feature_name: "PAYROLL_INTEGRATION", isActive: false },
  { id: "ff-09", feature_name: "ADVANCED_METRICS", isActive: true },
  { id: "ff-10", feature_name: "BIOMETRIC_SYNC", isActive: false },
] as const;

// ============================================================================
// 2. ORGANIZACIÓN Y SUCURSALES
// ============================================================================

const BRANCHES = [
  {
    id: "branch-01",
    name: "Sede Central",
    address: "Av. 27 de Febrero",
    city: "Santo Domingo",
    state: "Distrito Nacional",
    country: "RD",
    zipCode: "10101",
    phone: "809-555-0001",
    email: "hq@hospital.com",
    latitude: 18.4861,
    longitude: -69.9312,
    isMainBranch: true,
  },
  {
    id: "branch-02",
    name: "Clínica Norte",
    address: "Av. John F. Kennedy",
    city: "Santo Domingo",
    state: "Distrito Nacional",
    country: "RD",
    zipCode: "10102",
    phone: "809-555-0002",
    email: "norte@hospital.com",
    latitude: 18.49,
    longitude: -69.94,
    isMainBranch: false,
  },
  {
    id: "branch-03",
    name: "Anexo Pediátrico",
    address: "Calle Paseo",
    city: "Santiago",
    state: "Santiago",
    country: "RD",
    zipCode: "51000",
    phone: "809-555-0003",
    email: "pediatria@hospital.com",
    latitude: 19.45,
    longitude: -70.7,
    isMainBranch: false,
  },
  {
    id: "branch-04",
    name: "Centro Traumatológico",
    address: "Av. Las Américas",
    city: "Santo Domingo Este",
    state: "SD",
    country: "RD",
    zipCode: "11501",
    phone: "809-555-0004",
    email: "trauma@hospital.com",
    latitude: 18.47,
    longitude: -69.85,
    isMainBranch: false,
  },
  {
    id: "branch-05",
    name: "Unidad Oncológica",
    address: "Calle 5",
    city: "Santo Domingo",
    state: "Distrito Nacional",
    country: "RD",
    zipCode: "10105",
    phone: "809-555-0005",
    email: "onco@hospital.com",
    latitude: 18.46,
    longitude: -69.92,
    isMainBranch: false,
  },
  {
    id: "branch-06",
    name: "Clínica Sur",
    address: "Av. Independencia",
    city: "Santo Domingo",
    state: "Distrito Nacional",
    country: "RD",
    zipCode: "10106",
    phone: "809-555-0006",
    email: "sur@hospital.com",
    latitude: 18.45,
    longitude: -69.91,
    isMainBranch: false,
  },
  {
    id: "branch-07",
    name: "Centro Materno",
    address: "Av. Bolívar",
    city: "Santo Domingo",
    state: "Distrito Nacional",
    country: "RD",
    zipCode: "10107",
    phone: "809-555-0007",
    email: "materno@hospital.com",
    latitude: 18.475,
    longitude: -69.925,
    isMainBranch: false,
  },
  {
    id: "branch-08",
    name: "Anexo Psiquiátrico",
    address: "Km 28",
    city: "Pedro Brand",
    state: "SD",
    country: "RD",
    zipCode: "11701",
    phone: "809-555-0008",
    email: "psiq@hospital.com",
    latitude: 18.55,
    longitude: -70.05,
    isMainBranch: false,
  },
  {
    id: "branch-09",
    name: "Unidad de Rehabilitación",
    address: "Av. Luperón",
    city: "Santo Domingo Oeste",
    state: "SD",
    country: "RD",
    zipCode: "11601",
    phone: "809-555-0009",
    email: "rehab@hospital.com",
    latitude: 18.48,
    longitude: -69.98,
    isMainBranch: false,
  },
  {
    id: "branch-10",
    name: "Dispensario Médico",
    address: "Zona Colonial",
    city: "Santo Domingo",
    state: "Distrito Nacional",
    country: "RD",
    zipCode: "10210",
    phone: "809-555-0010",
    email: "dispensario@hospital.com",
    latitude: 18.47,
    longitude: -69.88,
    isMainBranch: false,
  },
] as const;

type DepartmentTypeValue =
  | "ICU"
  | "ER"
  | "PEDIATRICS"
  | "SURGERY"
  | "CARDIOLOGY"
  | "RADIOLOGY"
  | "ONCOLOGY"
  | "MATERNITY"
  | "LABORATORY"
  | "TRAUMA"
  | "INTERNAL_MEDICINE"
  | "GENERAL";

type DepartmentCriticalLevelValue = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface DepartmentSeed {
  id: string;
  name: string;
  code: string;
  description: string;
  branchId: string;
  type: DepartmentTypeValue;
  criticalLevel: DepartmentCriticalLevelValue;
  minimumStaff: number;
  optimalStaff: number;
  maxCapacity: number;
  allowOvertime: boolean;
}

const DEPARTMENTS: DepartmentSeed[] = [
  {
    id: "dept-01",
    name: "Cuidados Intensivos",
    code: "ICU-01",
    description: "UCI Principal",
    branchId: "branch-01",
    type: "ICU",
    criticalLevel: "CRITICAL",
    minimumStaff: 5,
    optimalStaff: 8,
    maxCapacity: 20,
    allowOvertime: true,
  },
  {
    id: "dept-02",
    name: "Emergencias",
    code: "ER-01",
    description: "Sala de Emergencias",
    branchId: "branch-01",
    type: "ER",
    criticalLevel: "CRITICAL",
    minimumStaff: 8,
    optimalStaff: 12,
    maxCapacity: 50,
    allowOvertime: true,
  },
  {
    id: "dept-03",
    name: "Pediatría",
    code: "PED-01",
    description: "Área Infantil",
    branchId: "branch-03",
    type: "PEDIATRICS",
    criticalLevel: "MEDIUM",
    minimumStaff: 4,
    optimalStaff: 6,
    maxCapacity: 30,
    allowOvertime: false,
  },
  {
    id: "dept-04",
    name: "Cirugía General",
    code: "SUR-01",
    description: "Quirófanos",
    branchId: "branch-01",
    type: "SURGERY",
    criticalLevel: "HIGH",
    minimumStaff: 6,
    optimalStaff: 10,
    maxCapacity: 15,
    allowOvertime: true,
  },
  {
    id: "dept-05",
    name: "Cardiología",
    code: "CAR-01",
    description: "Pabellón Cardíaco",
    branchId: "branch-01",
    type: "CARDIOLOGY",
    criticalLevel: "HIGH",
    minimumStaff: 3,
    optimalStaff: 5,
    maxCapacity: 20,
    allowOvertime: true,
  },
  {
    id: "dept-06",
    name: "Maternidad",
    code: "MAT-01",
    description: "Sala de Partos",
    branchId: "branch-07",
    type: "MATERNITY",
    criticalLevel: "HIGH",
    minimumStaff: 4,
    optimalStaff: 7,
    maxCapacity: 25,
    allowOvertime: true,
  },
  {
    id: "dept-07",
    name: "Oncología",
    code: "ONC-01",
    description: "Tratamiento de Cáncer",
    branchId: "branch-05",
    type: "ONCOLOGY",
    criticalLevel: "MEDIUM",
    minimumStaff: 3,
    optimalStaff: 5,
    maxCapacity: 15,
    allowOvertime: false,
  },
  {
    id: "dept-08",
    name: "Traumatología",
    code: "TRA-01",
    description: "Atención de Traumas",
    branchId: "branch-04",
    type: "TRAUMA",
    criticalLevel: "HIGH",
    minimumStaff: 5,
    optimalStaff: 8,
    maxCapacity: 40,
    allowOvertime: true,
  },
  {
    id: "dept-09",
    name: "Medicina Interna",
    code: "INT-01",
    description: "Hospitalización General",
    branchId: "branch-01",
    type: "INTERNAL_MEDICINE",
    criticalLevel: "LOW",
    minimumStaff: 3,
    optimalStaff: 5,
    maxCapacity: 60,
    allowOvertime: false,
  },
  {
    id: "dept-10",
    name: "Radiología",
    code: "RAD-01",
    description: "Imágenes Médicas",
    branchId: "branch-02",
    type: "RADIOLOGY",
    criticalLevel: "LOW",
    minimumStaff: 2,
    optimalStaff: 4,
    maxCapacity: 10,
    allowOvertime: false,
  },
];

const DEPARTMENT_CONFIGURATIONS = [
  { id: "dconf-01", departmentId: "dept-01", max_nights: 4, minimum_staff_per_shift: 5, allow_externeal_support: false, allow_double_shift: false },
  { id: "dconf-02", departmentId: "dept-02", max_nights: 6, minimum_staff_per_shift: 8, allow_externeal_support: true, allow_double_shift: true },
  { id: "dconf-03", departmentId: "dept-03", max_nights: 4, minimum_staff_per_shift: 4, allow_externeal_support: true, allow_double_shift: false },
  { id: "dconf-04", departmentId: "dept-04", max_nights: 3, minimum_staff_per_shift: 6, allow_externeal_support: false, allow_double_shift: false },
  { id: "dconf-05", departmentId: "dept-05", max_nights: 4, minimum_staff_per_shift: 3, allow_externeal_support: false, allow_double_shift: false },
  { id: "dconf-06", departmentId: "dept-06", max_nights: 5, minimum_staff_per_shift: 4, allow_externeal_support: true, allow_double_shift: true },
  { id: "dconf-07", departmentId: "dept-07", max_nights: 2, minimum_staff_per_shift: 3, allow_externeal_support: false, allow_double_shift: false },
  { id: "dconf-08", departmentId: "dept-08", max_nights: 5, minimum_staff_per_shift: 5, allow_externeal_support: true, allow_double_shift: true },
  { id: "dconf-09", departmentId: "dept-09", max_nights: 4, minimum_staff_per_shift: 3, allow_externeal_support: true, allow_double_shift: false },
  { id: "dconf-10", departmentId: "dept-10", max_nights: 3, minimum_staff_per_shift: 2, allow_externeal_support: false, allow_double_shift: false },
] as const;

// ============================================================================
// 3. ESPECIALIDADES Y DEPARTAMENTO-ESPECIALIDAD
// ============================================================================

const SPECIALITIES = [
  { id: "spec-01", name: "Intensivista", code: "SP-ICU", description: "Especialista en cuidados críticos" },
  { id: "spec-02", name: "Emergenciólogo", code: "SP-ER", description: "Atención rápida y trauma" },
  { id: "spec-03", name: "Pediatra Neonatal", code: "SP-PED", description: "Cuidado de recién nacidos" },
  { id: "spec-04", name: "Instrumentista", code: "SP-SURG", description: "Asistencia en quirófano" },
  { id: "spec-05", name: "Cardiología Clínica", code: "SP-CARD", description: "Cuidado cardíaco avanzado" },
  { id: "spec-06", name: "Obstetricia", code: "SP-OB", description: "Cuidados maternos" },
  { id: "spec-07", name: "Oncología Médica", code: "SP-ONC", description: "Manejo de quimioterapia" },
  { id: "spec-08", name: "Ortopedia", code: "SP-ORT", description: "Manejo de fracturas" },
  { id: "spec-09", name: "Geriatría", code: "SP-GER", description: "Cuidado de adultos mayores" },
  { id: "spec-10", name: "Radiología Intervencionista", code: "SP-RAD", description: "Procedimientos guiados por imagen" },
] as const;

const DEPARTMENT_SPECIALTIES = [
  { departmentId: "dept-01", specialityId: "spec-01", required: true, priority: 1, minimum_staff: 2 },
  { departmentId: "dept-02", specialityId: "spec-02", required: true, priority: 1, minimum_staff: 3 },
  { departmentId: "dept-03", specialityId: "spec-03", required: true, priority: 1, minimum_staff: 2 },
  { departmentId: "dept-04", specialityId: "spec-04", required: true, priority: 1, minimum_staff: 2 },
  { departmentId: "dept-05", specialityId: "spec-05", required: true, priority: 1, minimum_staff: 1 },
  { departmentId: "dept-06", specialityId: "spec-06", required: true, priority: 1, minimum_staff: 2 },
  { departmentId: "dept-07", specialityId: "spec-07", required: true, priority: 1, minimum_staff: 1 },
  { departmentId: "dept-08", specialityId: "spec-08", required: true, priority: 1, minimum_staff: 2 },
  { departmentId: "dept-09", specialityId: "spec-09", required: false, priority: 2, minimum_staff: 1 },
  { departmentId: "dept-10", specialityId: "spec-10", required: true, priority: 1, minimum_staff: 1 },
] as const;

// ============================================================================
// 4. ROLES
// ============================================================================
// Nota: el rol 'SUPER' lleva exactamente el nombre "SUPER" porque los guards
// de la aplicación hacen bypass de permisos cuando user.role === "SUPER".

const ROLES = [
  { id: "SUPER", name: "SUPER" },
  { id: "CRON", name: "USUARIO PARA EJECUCIONES DE JOBS" },
  { id: "role-01", name: "SUPERVISOR_GENERAL" },
  { id: "role-02", name: "NURSE_SENIOR" },
  { id: "role-03", name: "NURSE_JUNIOR" },
  { id: "role-04", name: "HR_MANAGER" },
  { id: "role-05", name: "SYSTEM_ADMIN" },
  { id: "role-06", name: "DEPARTMENT_HEAD" },
  { id: "role-07", name: "NIGHT_SUPERVISOR" },
  { id: "role-08", name: "TEMP_NURSE" },
  { id: "role-09", name: "AUDITOR" },
  { id: "role-10", name: "READ_ONLY_VIEWER" },
] as const;

// ============================================================================
// 5. USUARIOS
// ============================================================================
// Password hash: bcrypt de "8998414" (pcabreram1234@gmail.com) y del cron-bot,
// idéntico al de DummyData.sql.

const USERS = [
  {
    id: "user-00",
    email: "pcabreram1234@gmail.com",
    password: DEFAULT_PASSWORD_HASH,
    firstName: "Phillip",
    lastName: "Cabrera",
    departmentId: "dept-01",
    rolesId: "SUPER",
  },
  {
    id: CRON_BOT_USER_ID,
    email: "cronbot@sistema.local",
    password: DEFAULT_PASSWORD_HASH,
    firstName: "SYSTEM",
    lastName: "CRON_BOT",
    departmentId: "dept-01",
    rolesId: "CRON",
  },
  { id: "user-01", email: "maria.perez@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Maria", lastName: "Perez", departmentId: "dept-01", rolesId: "role-02" },
  { id: "user-02", email: "juan.gomez@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Juan", lastName: "Gomez", departmentId: "dept-02", rolesId: "role-03" },
  { id: "user-03", email: "ana.lopez@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Ana", lastName: "Lopez", departmentId: "dept-03", rolesId: "role-02" },
  { id: "user-04", email: "carlos.ruiz@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Carlos", lastName: "Ruiz", departmentId: "dept-04", rolesId: "role-06" },
  { id: "user-05", email: "luisa.fernandez@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Luisa", lastName: "Fernandez", departmentId: "dept-05", rolesId: "role-03" },
  { id: "user-06", email: "pedro.martinez@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Pedro", lastName: "Martinez", departmentId: "dept-06", rolesId: "role-08" },
  { id: "user-07", email: "laura.diaz@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Laura", lastName: "Diaz", departmentId: "dept-07", rolesId: "role-02" },
  { id: "user-08", email: "jorge.torres@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Jorge", lastName: "Torres", departmentId: "dept-08", rolesId: "role-03" },
  { id: "user-09", email: "carmen.vargas@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Carmen", lastName: "Vargas", departmentId: "dept-09", rolesId: "role-07" },
  { id: "user-10", email: "miguel.castro@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Miguel", lastName: "Castro", departmentId: "dept-10", rolesId: "role-02" },
  { id: "user-11", email: "elena.blanco@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Elena", lastName: "Blanco", departmentId: "dept-01", rolesId: "role-02" },
  { id: "user-12", email: "ramon.santos@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Ramon", lastName: "Santos", departmentId: "dept-01", rolesId: "role-02" },
  { id: "user-13", email: "lucia.mendez@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Lucia", lastName: "Mendez", departmentId: "dept-01", rolesId: "role-02" },
  { id: "user-14", email: "marcos.reyes@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Marcos", lastName: "Reyes", departmentId: "dept-01", rolesId: "role-02" },
  { id: "user-15", email: "sofia.ortiz@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Sofia", lastName: "Ortiz", departmentId: "dept-02", rolesId: "role-03" },
  { id: "user-16", email: "gabriel.nunez@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Gabriel", lastName: "Nunez", departmentId: "dept-02", rolesId: "role-03" },
  { id: "user-17", email: "patricia.sosa@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Patricia", lastName: "Sosa", departmentId: "dept-02", rolesId: "role-03" },
  { id: "user-18", email: "andres.brito@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Andres", lastName: "Brito", departmentId: "dept-03", rolesId: "role-02" },
  { id: "user-19", email: "claudia.gil@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Claudia", lastName: "Gil", departmentId: "dept-03", rolesId: "role-02" },
  { id: "user-20", email: "manuel.rosa@hgc.com", password: DEFAULT_PASSWORD_HASH, firstName: "Manuel", lastName: "Rosa", departmentId: "dept-03", rolesId: "role-02" },
] as const;

type ContractTypeValue = "PERMANENT" | "TEMPORAL" | "PER_DIEM" | "PART_TIME";
type NurseStatusValue = "ACTIVE" | "INACTIVE" | "VACATION" | "LICENSE" | "SUSPENDED";

interface NurseSeed {
  id: string;
  userId: string;
  departmentId: string;
  contract_type: ContractTypeValue;
  hire_date: string; // 'YYYY-MM-DD'
  specialityId: string;
  status: NurseStatusValue;
}

const NURSES: NurseSeed[] = [
  { id: "3432cddc-61b2-4ead-b451-d6837d365230", userId: "user-01", departmentId: "dept-01", contract_type: "PERMANENT", hire_date: "2020-01-15", specialityId: "spec-01", status: "ACTIVE" },
  { id: "7a0ac1ba-747b-484d-8945-47e01da2d4e4", userId: "user-02", departmentId: "dept-02", contract_type: "PERMANENT", hire_date: "2021-03-10", specialityId: "spec-02", status: "ACTIVE" },
  { id: "77d3ad03-5bc5-46b7-9368-59f97813f8d5", userId: "user-03", departmentId: "dept-03", contract_type: "PERMANENT", hire_date: "2019-06-20", specialityId: "spec-03", status: "ACTIVE" },
  { id: "72f0abd2-3623-4b50-a04e-5a2fe9116115", userId: "user-04", departmentId: "dept-04", contract_type: "PERMANENT", hire_date: "2018-11-05", specialityId: "spec-04", status: "ACTIVE" },
  { id: "5a3ea5a3-336c-435b-88dd-4f32684a9f28", userId: "user-05", departmentId: "dept-05", contract_type: "PART_TIME", hire_date: "2022-02-28", specialityId: "spec-05", status: "ACTIVE" },
  { id: "1009431d-7fce-4afa-9f8c-5f87c44c565a", userId: "user-06", departmentId: "dept-06", contract_type: "TEMPORAL", hire_date: "2023-08-15", specialityId: "spec-06", status: "ACTIVE" },
  { id: "6a7cc694-c0e9-4b1c-99b0-4d32f2ce448f", userId: "user-07", departmentId: "dept-07", contract_type: "PERMANENT", hire_date: "2017-04-12", specialityId: "spec-07", status: "ACTIVE" },
  { id: "2464e78c-b2ac-4a69-83c8-6ac2182a70d6", userId: "user-08", departmentId: "dept-08", contract_type: "PER_DIEM", hire_date: "2023-01-20", specialityId: "spec-08", status: "ACTIVE" },
  { id: "fb2227ac-8205-4436-9045-6eb0308dee5f", userId: "user-09", departmentId: "dept-09", contract_type: "PERMANENT", hire_date: "2015-09-30", specialityId: "spec-09", status: "ACTIVE" },
  { id: "819bf95e-1797-496c-8f57-ad6bc46f5721", userId: "user-10", departmentId: "dept-10", contract_type: "PERMANENT", hire_date: "2020-12-01", specialityId: "spec-10", status: "ACTIVE" },
  { id: "0b992205-074a-46a2-befe-28521aabe60c", userId: "user-11", departmentId: "dept-01", contract_type: "PERMANENT", hire_date: "2021-05-14", specialityId: "spec-01", status: "ACTIVE" },
  { id: "ef716d9f-87aa-4c13-bed9-727b767e8206", userId: "user-12", departmentId: "dept-01", contract_type: "PART_TIME", hire_date: "2022-09-01", specialityId: "spec-01", status: "ACTIVE" },
  { id: "c17676f2-7d22-461f-bfcd-b70fc7152f7b", userId: "user-13", departmentId: "dept-01", contract_type: "TEMPORAL", hire_date: "2023-11-15", specialityId: "spec-02", status: "ACTIVE" },
  { id: "1018875c-ceaa-4b0b-b72d-f8d38be1e506", userId: "user-14", departmentId: "dept-01", contract_type: "PERMANENT", hire_date: "2020-07-19", specialityId: "spec-03", status: "ACTIVE" },
  { id: "18e7f2b1-febc-4a62-9edc-107d23e33a13", userId: "user-15", departmentId: "dept-02", contract_type: "PERMANENT", hire_date: "2019-02-11", specialityId: "spec-02", status: "ACTIVE" },
  { id: "9af6b81f-10a0-4cbb-bd8f-eaa31077de6e", userId: "user-16", departmentId: "dept-02", contract_type: "PART_TIME", hire_date: "2022-06-22", specialityId: "spec-01", status: "ACTIVE" },
  { id: "c99421f2-4a31-4806-9a0b-afbbc02bbe18", userId: "user-17", departmentId: "dept-02", contract_type: "PER_DIEM", hire_date: "2024-01-10", specialityId: "spec-02", status: "ACTIVE" },
  { id: "102fb448-4481-4fa4-8b31-ffcfb5798064", userId: "user-18", departmentId: "dept-03", contract_type: "PERMANENT", hire_date: "2018-04-05", specialityId: "spec-03", status: "ACTIVE" },
  { id: "1d5e33d1-1cd9-439d-bd5a-cb0722dadd91", userId: "user-19", departmentId: "dept-03", contract_type: "TEMPORAL", hire_date: "2023-05-20", specialityId: "spec-01", status: "ACTIVE" },
  { id: "9b998b31-63bd-4bcb-9296-0f84444f696d", userId: "user-20", departmentId: "dept-03", contract_type: "PERMANENT", hire_date: "2021-10-01", specialityId: "spec-04", status: "ACTIVE" },
];

const NURSE_PROFILES = [
  { id: "prof-01", nurseId: "3432cddc-61b2-4ead-b451-d6837d365230", birthDate: "1985-04-12", emergencyContactName: "Jose Perez", emergencyContactPhone: "809-111-2222", educationLevel: "BACHELOR_DEGREE", yearsOfExperience: 10, notes: "Ninguna" },
  { id: "prof-02", nurseId: "7a0ac1ba-747b-484d-8945-47e01da2d4e4", birthDate: "1992-07-23", emergencyContactName: "Marta Gomez", emergencyContactPhone: "809-222-3333", educationLevel: "TECHNICIAN", yearsOfExperience: 4, notes: "Alergia al látex" },
  { id: "prof-03", nurseId: "77d3ad03-5bc5-46b7-9368-59f97813f8d5", birthDate: "1988-11-05", emergencyContactName: "Luis Lopez", emergencyContactPhone: "809-333-4444", educationLevel: "SPECIALIZATION", yearsOfExperience: 8, notes: "Ninguna" },
  { id: "prof-04", nurseId: "72f0abd2-3623-4b50-a04e-5a2fe9116115", birthDate: "1980-02-14", emergencyContactName: "Sara Ruiz", emergencyContactPhone: "809-444-5555", educationLevel: "MASTER_DEGREE", yearsOfExperience: 15, notes: "Hipertensión controlada" },
  { id: "prof-05", nurseId: "5a3ea5a3-336c-435b-88dd-4f32684a9f28", birthDate: "1995-09-30", emergencyContactName: "Raul Fernandez", emergencyContactPhone: "809-555-6666", educationLevel: "BACHELOR_DEGREE", yearsOfExperience: 3, notes: "Asma leve" },
  { id: "prof-06", nurseId: "1009431d-7fce-4afa-9f8c-5f87c44c565a", birthDate: "1998-12-10", emergencyContactName: "Elena Martinez", emergencyContactPhone: "809-666-7777", educationLevel: "ASSISTANT", yearsOfExperience: 2, notes: "Ninguna" },
  { id: "prof-07", nurseId: "6a7cc694-c0e9-4b1c-99b0-4d32f2ce448f", birthDate: "1983-06-25", emergencyContactName: "Diego Diaz", emergencyContactPhone: "809-777-8888", educationLevel: "SPECIALIZATION", yearsOfExperience: 12, notes: "Migrañas ocasionales" },
  { id: "prof-08", nurseId: "2464e78c-b2ac-4a69-83c8-6ac2182a70d6", birthDate: "1990-03-18", emergencyContactName: "Rosa Torres", emergencyContactPhone: "809-888-9999", educationLevel: "TECHNICIAN", yearsOfExperience: 5, notes: "Ninguna" },
  { id: "prof-09", nurseId: "fb2227ac-8205-4436-9045-6eb0308dee5f", birthDate: "1975-08-08", emergencyContactName: "Hugo Vargas", emergencyContactPhone: "809-999-0000", educationLevel: "MASTER_DEGREE", yearsOfExperience: 20, notes: "Problemas de rodilla" },
  { id: "prof-10", nurseId: "819bf95e-1797-496c-8f57-ad6bc46f5721", birthDate: "1987-01-20", emergencyContactName: "Clara Castro", emergencyContactPhone: "809-000-1111", educationLevel: "BACHELOR_DEGREE", yearsOfExperience: 9, notes: "Ninguna" },
  { id: "prof-11", nurseId: "0b992205-074a-46a2-befe-28521aabe60c", birthDate: "1994-11-23", emergencyContactName: "Pedro Blanco", emergencyContactPhone: "809-555-0111", educationLevel: "BACHELOR_DEGREE", yearsOfExperience: 5, notes: "Ninguna" },
  { id: "prof-12", nurseId: "ef716d9f-87aa-4c13-bed9-727b767e8206", birthDate: "1991-02-14", emergencyContactName: "Juana Santos", emergencyContactPhone: "809-555-0122", educationLevel: "TECHNICIAN", yearsOfExperience: 4, notes: "Ninguna" },
  { id: "prof-13", nurseId: "c17676f2-7d22-461f-bfcd-b70fc7152f7b", birthDate: "1996-08-05", emergencyContactName: "Miguel Mendez", emergencyContactPhone: "809-555-0133", educationLevel: "BACHELOR_DEGREE", yearsOfExperience: 2, notes: "Ninguna" },
  { id: "prof-14", nurseId: "1018875c-ceaa-4b0b-b72d-f8d38be1e506", birthDate: "1989-05-19", emergencyContactName: "Ana Reyes", emergencyContactPhone: "809-555-0144", educationLevel: "SPECIALIZATION", yearsOfExperience: 6, notes: "Dolor lumbar leve" },
  { id: "prof-15", nurseId: "18e7f2b1-febc-4a62-9edc-107d23e33a13", birthDate: "1986-01-30", emergencyContactName: "Carlos Ortiz", emergencyContactPhone: "809-555-0155", educationLevel: "MASTER_DEGREE", yearsOfExperience: 7, notes: "Ninguna" },
  { id: "prof-16", nurseId: "9af6b81f-10a0-4cbb-bd8f-eaa31077de6e", birthDate: "1993-07-04", emergencyContactName: "Laura Nunez", emergencyContactPhone: "809-555-0166", educationLevel: "BACHELOR_DEGREE", yearsOfExperience: 3, notes: "Ninguna" },
  { id: "prof-17", nurseId: "c99421f2-4a31-4806-9a0b-afbbc02bbe18", birthDate: "1997-12-25", emergencyContactName: "Felix Sosa", emergencyContactPhone: "809-555-0177", educationLevel: "ASSISTANT", yearsOfExperience: 1, notes: "Ninguna" },
  { id: "prof-18", nurseId: "102fb448-4481-4fa4-8b31-ffcfb5798064", birthDate: "1982-03-12", emergencyContactName: "Marta Brito", emergencyContactPhone: "809-555-0184", educationLevel: "SPECIALIZATION", yearsOfExperience: 11, notes: "Ninguna" },
  { id: "prof-19", nurseId: "1d5e33d1-1cd9-439d-bd5a-cb0722dadd91", birthDate: "1995-06-15", emergencyContactName: "Julio Gil", emergencyContactPhone: "809-555-0199", educationLevel: "TECHNICIAN", yearsOfExperience: 3, notes: "Ninguna" },
  { id: "prof-20", nurseId: "9b998b31-63bd-4bcb-9296-0f84444f696d", birthDate: "1990-10-22", emergencyContactName: "Sofia Rosa", emergencyContactPhone: "809-555-0200", educationLevel: "BACHELOR_DEGREE", yearsOfExperience: 5, notes: "Ninguna" },
] as const;

type PreferredShiftValue = "MORNING" | "AFTERNOON" | "NIGHT" | "MORNING_AFTERNOON" | "MORNING_NIGHT" | "NIGTH_AFTERNOON";

const NURSE_PREFERENCES = [
  { id: "pref-01", nurseId: "3432cddc-61b2-4ead-b451-d6837d365230", preferredShift: "MORNING", avoid_shifts: "NIGHT", maxNigthsPerMonth: 2, maxDaysPerMonth: 20, preferredDaysOff: 8, prefersWeekendsOff: true, allowOvertime: false },
  { id: "pref-02", nurseId: "7a0ac1ba-747b-484d-8945-47e01da2d4e4", preferredShift: "AFTERNOON", avoid_shifts: "MORNING", maxNigthsPerMonth: 6, maxDaysPerMonth: 22, preferredDaysOff: 6, prefersWeekendsOff: false, allowOvertime: true },
  { id: "pref-03", nurseId: "77d3ad03-5bc5-46b7-9368-59f97813f8d5", preferredShift: "MORNING", avoid_shifts: "NIGHT", maxNigthsPerMonth: 0, maxDaysPerMonth: 20, preferredDaysOff: 8, prefersWeekendsOff: true, allowOvertime: false },
  { id: "pref-04", nurseId: "72f0abd2-3623-4b50-a04e-5a2fe9116115", preferredShift: "AFTERNOON", avoid_shifts: "NIGHT", maxNigthsPerMonth: 4, maxDaysPerMonth: 18, preferredDaysOff: 10, prefersWeekendsOff: true, allowOvertime: true },
  { id: "pref-05", nurseId: "5a3ea5a3-336c-435b-88dd-4f32684a9f28", preferredShift: "NIGHT", avoid_shifts: "MORNING", maxNigthsPerMonth: 12, maxDaysPerMonth: 15, preferredDaysOff: 12, prefersWeekendsOff: false, allowOvertime: true },
  { id: "pref-06", nurseId: "1009431d-7fce-4afa-9f8c-5f87c44c565a", preferredShift: "AFTERNOON", avoid_shifts: "NIGHT", maxNigthsPerMonth: 4, maxDaysPerMonth: 20, preferredDaysOff: 8, prefersWeekendsOff: false, allowOvertime: true },
  { id: "pref-07", nurseId: "6a7cc694-c0e9-4b1c-99b0-4d32f2ce448f", preferredShift: "MORNING", avoid_shifts: "NIGHT", maxNigthsPerMonth: 2, maxDaysPerMonth: 20, preferredDaysOff: 8, prefersWeekendsOff: true, allowOvertime: false },
  { id: "pref-08", nurseId: "2464e78c-b2ac-4a69-83c8-6ac2182a70d6", preferredShift: "AFTERNOON", avoid_shifts: "MORNING", maxNigthsPerMonth: 8, maxDaysPerMonth: 20, preferredDaysOff: 8, prefersWeekendsOff: false, allowOvertime: true },
  { id: "pref-09", nurseId: "fb2227ac-8205-4436-9045-6eb0308dee5f", preferredShift: "MORNING", avoid_shifts: "NIGHT", maxNigthsPerMonth: 0, maxDaysPerMonth: 15, preferredDaysOff: 12, prefersWeekendsOff: true, allowOvertime: false },
  { id: "pref-10", nurseId: "819bf95e-1797-496c-8f57-ad6bc46f5721", preferredShift: "NIGHT", avoid_shifts: "AFTERNOON", maxNigthsPerMonth: 10, maxDaysPerMonth: 18, preferredDaysOff: 10, prefersWeekendsOff: false, allowOvertime: true },
  { id: "pref-11", nurseId: "0b992205-074a-46a2-befe-28521aabe60c", preferredShift: "NIGHT", avoid_shifts: "AFTERNOON", maxNigthsPerMonth: 8, maxDaysPerMonth: 20, preferredDaysOff: 8, prefersWeekendsOff: false, allowOvertime: true },
  { id: "pref-12", nurseId: "ef716d9f-87aa-4c13-bed9-727b767e8206", preferredShift: "MORNING", avoid_shifts: "NIGHT", maxNigthsPerMonth: 2, maxDaysPerMonth: 16, preferredDaysOff: 12, prefersWeekendsOff: true, allowOvertime: false },
  { id: "pref-13", nurseId: "c17676f2-7d22-461f-bfcd-b70fc7152f7b", preferredShift: "AFTERNOON", avoid_shifts: "MORNING", maxNigthsPerMonth: 4, maxDaysPerMonth: 22, preferredDaysOff: 6, prefersWeekendsOff: false, allowOvertime: true },
  { id: "pref-14", nurseId: "1018875c-ceaa-4b0b-b72d-f8d38be1e506", preferredShift: "MORNING", avoid_shifts: "AFTERNOON", maxNigthsPerMonth: 0, maxDaysPerMonth: 20, preferredDaysOff: 8, prefersWeekendsOff: true, allowOvertime: false },
  { id: "pref-15", nurseId: "18e7f2b1-febc-4a62-9edc-107d23e33a13", preferredShift: "MORNING", avoid_shifts: "NIGHT", maxNigthsPerMonth: 2, maxDaysPerMonth: 22, preferredDaysOff: 8, prefersWeekendsOff: true, allowOvertime: true },
  { id: "pref-16", nurseId: "9af6b81f-10a0-4cbb-bd8f-eaa31077de6e", preferredShift: "AFTERNOON", avoid_shifts: "NIGHT", maxNigthsPerMonth: 4, maxDaysPerMonth: 18, preferredDaysOff: 10, prefersWeekendsOff: false, allowOvertime: true },
  { id: "pref-17", nurseId: "c99421f2-4a31-4806-9a0b-afbbc02bbe18", preferredShift: "NIGHT", avoid_shifts: "MORNING", maxNigthsPerMonth: 12, maxDaysPerMonth: 15, preferredDaysOff: 12, prefersWeekendsOff: false, allowOvertime: true },
  { id: "pref-18", nurseId: "102fb448-4481-4fa4-8b31-ffcfb5798064", preferredShift: "AFTERNOON", avoid_shifts: "MORNING", maxNigthsPerMonth: 6, maxDaysPerMonth: 20, preferredDaysOff: 8, prefersWeekendsOff: true, allowOvertime: false },
  { id: "pref-19", nurseId: "1d5e33d1-1cd9-439d-bd5a-cb0722dadd91", preferredShift: "MORNING", avoid_shifts: "NIGHT", maxNigthsPerMonth: 0, maxDaysPerMonth: 20, preferredDaysOff: 8, prefersWeekendsOff: false, allowOvertime: true },
  { id: "pref-20", nurseId: "9b998b31-63bd-4bcb-9296-0f84444f696d", preferredShift: "NIGHT", avoid_shifts: "AFTERNOON", maxNigthsPerMonth: 10, maxDaysPerMonth: 18, preferredDaysOff: 10, prefersWeekendsOff: true, allowOvertime: true },
] as const;

// ============================================================================
// 6. TIPOS DE RESTRICCIÓN Y RESTRICCIONES
// ============================================================================

const NURSE_RESTRICTION_TYPES = [
  { id: "restype-01", code: "R-001", name: "NO_NIGHT_SHIFTS", description: "NO_PUEDE_HACER_AMANECIDAS", severity: "HIGH", affects_scheduler: true, affects_overtime: false, affects_nights: true, isSystem: true, isActive: true },
  { id: "restype-02", code: "R-002", name: "NO_OVERTIME", description: "NO_OVERTIME", severity: "MEDIUM", affects_scheduler: true, affects_overtime: true, affects_nights: false, isSystem: true, isActive: true },
  { id: "restype-03", code: "R-003", name: "NO_WEEKENDS", description: "NO_TRABAJA_FINES_DE_SEMANA", severity: "HIGH", affects_scheduler: true, affects_overtime: false, affects_nights: false, isSystem: true, isActive: true },
  { id: "restype-04", code: "R-004", name: "MAX_40_HOURS_WEEK", description: "MAXIMO_40H", severity: "CRITICAL", affects_scheduler: true, affects_overtime: true, affects_nights: false, isSystem: true, isActive: true },
  { id: "restype-05", code: "R-005", name: "MEDICAL_RESTRICTION", description: "RESTRICCION_MEDICA_GENERAL", severity: "CRITICAL", affects_scheduler: true, affects_overtime: true, affects_nights: true, isSystem: true, isActive: true },
  { id: "restype-06", code: "R-006", name: "PREGNANCY_RESTRICTION", description: "RESTRICCION_EMBARAZO", severity: "CRITICAL", affects_scheduler: true, affects_overtime: true, affects_nights: true, isSystem: true, isActive: true },
  { id: "restype-07", code: "R-007", name: "ONLY_DAY_SHIFTS", description: "SOLO_TRABAJA_DIAS", severity: "HIGH", affects_scheduler: true, affects_overtime: false, affects_nights: true, isSystem: true, isActive: true },
  { id: "restype-08", code: "R-008", name: "NO_DOUBLE_SHIFTS", description: "NO_PUEDE_HACER_DOBLE_TURNO", severity: "HIGH", affects_scheduler: true, affects_overtime: false, affects_nights: false, isSystem: true, isActive: true },
  { id: "restype-09", code: "R-009", name: "NO_CONSECUTIVE_NIGHTS", description: "NO_NOCHES_CONSECUTIVAS", severity: "MEDIUM", affects_scheduler: true, affects_overtime: false, affects_nights: true, isSystem: true, isActive: true },
  { id: "restype-10", code: "R-010", name: "PART_TIME_ONLY", description: "SOLO_MEDIO_TIEMPO", severity: "HIGH", affects_scheduler: true, affects_overtime: true, affects_nights: false, isSystem: true, isActive: true },
] as const;

const NURSE_RESTRICTIONS = [
  { id: "nrest-01", nurseId: "77d3ad03-5bc5-46b7-9368-59f97813f8d5", restrictionTypeId: "restype-01", isTemporary: false, isActive: true },
  { id: "nrest-02", nurseId: "fb2227ac-8205-4436-9045-6eb0308dee5f", restrictionTypeId: "restype-05", isTemporary: true, isActive: true },
  { id: "nrest-03", nurseId: "72f0abd2-3623-4b50-a04e-5a2fe9116115", restrictionTypeId: "restype-08", isTemporary: false, isActive: true },
  { id: "nrest-04", nurseId: "3432cddc-61b2-4ead-b451-d6837d365230", restrictionTypeId: "restype-02", isTemporary: false, isActive: true },
  { id: "nrest-05", nurseId: "6a7cc694-c0e9-4b1c-99b0-4d32f2ce448f", restrictionTypeId: "restype-06", isTemporary: true, isActive: true },
  { id: "nrest-06", nurseId: "5a3ea5a3-336c-435b-88dd-4f32684a9f28", restrictionTypeId: "restype-10", isTemporary: false, isActive: true },
  { id: "nrest-07", nurseId: "1009431d-7fce-4afa-9f8c-5f87c44c565a", restrictionTypeId: "restype-09", isTemporary: false, isActive: true },
  { id: "nrest-08", nurseId: "819bf95e-1797-496c-8f57-ad6bc46f5721", restrictionTypeId: "restype-04", isTemporary: false, isActive: true },
  { id: "nrest-09", nurseId: "7a0ac1ba-747b-484d-8945-47e01da2d4e4", restrictionTypeId: "restype-03", isTemporary: true, isActive: true },
  { id: "nrest-10", nurseId: "2464e78c-b2ac-4a69-83c8-6ac2182a70d6", restrictionTypeId: "restype-07", isTemporary: false, isActive: true },
] as const;

// ============================================================================
// 7. TURNOS Y PLANTILLAS DE TURNO
// ============================================================================
// Los valores de durationHours son enteros (horas), no timestamps.
// Las plantillas usan los valores ajustados y consistentes de la BD actual.

const SHIFTS = [
  { id: "sh-01", name: "Mañana Normal", code: "M-01", type: "MORNING", startTime: d("2026-06-01 07:00:00"), endTime: d("2026-06-01 15:00:00"), durationHours: 8, departmentId: "dept-01" },
  { id: "sh-02", name: "Tarde Normal", code: "T-01", type: "AFTERNOON", startTime: d("2026-06-01 15:00:00"), endTime: d("2026-06-01 23:00:00"), durationHours: 8, departmentId: "dept-01" },
  { id: "sh-03", name: "Noche Normal", code: "N-01", type: "NIGHT", startTime: d("2026-06-01 23:00:00"), endTime: d("2026-06-02 07:00:00"), durationHours: 8, departmentId: "dept-01" },
  { id: "sh-04", name: "Guardia 12h Día", code: "G12-D", type: "MORNING", startTime: d("2026-06-01 07:00:00"), endTime: d("2026-06-01 19:00:00"), durationHours: 12, departmentId: "dept-02" },
  { id: "sh-05", name: "Guardia 12h Noche", code: "G12-N", type: "NIGHT", startTime: d("2026-06-01 19:00:00"), endTime: d("2026-06-02 07:00:00"), durationHours: 12, departmentId: "dept-02" },
  { id: "sh-06", name: "Soporte Corto", code: "S-01", type: "MORNING", startTime: d("2026-06-01 08:00:00"), endTime: d("2026-06-01 12:00:00"), durationHours: 4, departmentId: "dept-03" },
  { id: "sh-07", name: "Turno Quirófano A", code: "Q-01", type: "MORNING", startTime: d("2026-06-01 06:00:00"), endTime: d("2026-06-01 14:00:00"), durationHours: 8, departmentId: "dept-04" },
  { id: "sh-08", name: "Turno Quirófano B", code: "Q-02", type: "AFTERNOON", startTime: d("2026-06-01 14:00:00"), endTime: d("2026-06-01 22:00:00"), durationHours: 8, departmentId: "dept-04" },
  { id: "sh-09", name: "Refuerzo Noche", code: "RN-01", type: "NIGHT", startTime: d("2026-06-01 20:00:00"), endTime: d("2026-06-02 04:00:00"), durationHours: 8, departmentId: "dept-05" },
  { id: "sh-10", name: "Jornada Completa", code: "JC-01", type: "MORNING", startTime: d("2026-06-01 08:00:00"), endTime: d("2026-06-01 17:00:00"), durationHours: 9, departmentId: "dept-09" },
] as const;

type PreferredShiftTemplate = "MORNING" | "AFTERNOON" | "NIGHT";

const SHIFT_TEMPLATES = [
  { id: "tmpl-01", name: "MORNING", description: "Patrón UCI 8h", departmentId: "dept-01", minimum_staff: 3, durationHours: 8, isNightShift: false, startTime: "07:00", endTime: "15:00", color: "#0aaef5", isActive: true, autoAssignable: true, priority: 1 },
  { id: "tmpl-02", name: "AFTERNOON", description: "Patrón ER 12h", departmentId: "dept-02", minimum_staff: 4, durationHours: 12, isNightShift: false, startTime: "07:00", endTime: "19:00", color: "#f4f73b", isActive: true, autoAssignable: true, priority: 1 },
  { id: "tmpl-03", name: "MORNING", description: "Patrón Pediatría", departmentId: "dept-03", minimum_staff: 2, durationHours: 8, isNightShift: false, startTime: "08:00", endTime: "16:00", color: "#510af5", isActive: true, autoAssignable: true, priority: 1 },
  { id: "tmpl-04", name: "MORNING", description: "Plantilla Quirófano", departmentId: "dept-04", minimum_staff: 5, durationHours: 12, isNightShift: false, startTime: "06:00", endTime: "14:00", color: null, isActive: true, autoAssignable: true, priority: 1 },
  { id: "tmpl-05", name: "AFTERNOON", description: "Cardio Regular", departmentId: "dept-05", minimum_staff: 2, durationHours: 8, isNightShift: false, startTime: "07:00", endTime: "15:00", color: "#f7e73b", isActive: true, autoAssignable: true, priority: 1 },
  { id: "tmpl-06", name: "NIGHT", description: "Maternidad 24/7", departmentId: "dept-06", minimum_staff: 3, durationHours: 10, isNightShift: true, startTime: "23:00", endTime: "07:00", color: null, isActive: true, autoAssignable: true, priority: 1 },
  { id: "tmpl-07", name: "MORNING", description: "Oncología Día", departmentId: "dept-07", minimum_staff: 2, durationHours: 9, isNightShift: false, startTime: "08:00", endTime: "17:00", color: "#0aaef5", isActive: true, autoAssignable: true, priority: 1 },
  { id: "tmpl-08", name: "AFTERNOON", description: "Trauma Refuerzo", departmentId: "dept-08", minimum_staff: 4, durationHours: 16, isNightShift: false, startTime: "19:00", endTime: "07:00", color: null, isActive: true, autoAssignable: true, priority: 1 },
  { id: "tmpl-09", name: "MORNING", description: "Medicina Interna Base", departmentId: "dept-09", minimum_staff: 3, durationHours: 9, isNightShift: false, startTime: "07:00", endTime: "16:00", color: "#0a12f5", isActive: true, autoAssignable: true, priority: 1 },
  { id: "tmpl-10", name: "MORNING", description: "Radiología Corto", departmentId: "dept-10", minimum_staff: 1, durationHours: 12, isNightShift: false, startTime: "08:00", endTime: "12:00", color: null, isActive: true, autoAssignable: true, priority: 1 },
] as const;

// ============================================================================
// 8. EVENTOS DE TIEMPO (ausencias, disponibilidad, vacaciones, licencias)
// ============================================================================

const ABSENCES = [
  { id: "abs-01", nurseId: "3432cddc-61b2-4ead-b451-d6837d365230", date: d("2026-06-05 00:00:00"), type: "SICKNESS", reason: "Fiebre alta", reporterById: "user-01" },
  { id: "abs-02", nurseId: "7a0ac1ba-747b-484d-8945-47e01da2d4e4", date: d("2026-06-12 00:00:00"), type: "PERSONAL", reason: "Asunto familiar", reporterById: "user-02" },
  { id: "abs-03", nurseId: "77d3ad03-5bc5-46b7-9368-59f97813f8d5", date: d("2026-06-15 00:00:00"), type: "MEDICAL_LICENSE", reason: "Cita médica", reporterById: "user-03" },
  { id: "abs-04", nurseId: "72f0abd2-3623-4b50-a04e-5a2fe9116115", date: d("2026-06-18 00:00:00"), type: "EMERGENCY", reason: "Emergencia en casa", reporterById: "user-04" },
  { id: "abs-05", nurseId: "5a3ea5a3-336c-435b-88dd-4f32684a9f28", date: d("2026-06-20 00:00:00"), type: "SICKNESS", reason: "Migraña severa", reporterById: "user-05" },
  { id: "abs-06", nurseId: "1009431d-7fce-4afa-9f8c-5f87c44c565a", date: d("2026-06-22 00:00:00"), type: "UNJUSTIFIED", reason: "No se presentó", reporterById: "user-01" },
  { id: "abs-07", nurseId: "6a7cc694-c0e9-4b1c-99b0-4d32f2ce448f", date: d("2026-06-25 00:00:00"), type: "PERSONAL", reason: "Trámites legales", reporterById: "user-07" },
  { id: "abs-08", nurseId: "2464e78c-b2ac-4a69-83c8-6ac2182a70d6", date: d("2026-06-28 00:00:00"), type: "SICKNESS", reason: "Gastroenteritis", reporterById: "user-08" },
  { id: "abs-09", nurseId: "fb2227ac-8205-4436-9045-6eb0308dee5f", date: d("2026-06-30 00:00:00"), type: "MEDICAL_LICENSE", reason: "Terapia física", reporterById: "user-09" },
  { id: "abs-10", nurseId: "819bf95e-1797-496c-8f57-ad6bc46f5721", date: d("2026-06-10 00:00:00"), type: "EMERGENCY", reason: "Accidente de tránsito leve", reporterById: "user-10" },
] as const;

const NURSE_AVAILABILITY = [
  { id: "av-01", nurseId: "3432cddc-61b2-4ead-b451-d6837d365230", date: d("2026-06-01 00:00:00"), status: "AVAILABLE" },
  { id: "av-02", nurseId: "7a0ac1ba-747b-484d-8945-47e01da2d4e4", date: d("2026-06-02 00:00:00"), status: "PARTIAL" },
  { id: "av-03", nurseId: "77d3ad03-5bc5-46b7-9368-59f97813f8d5", date: d("2026-06-03 00:00:00"), status: "NOT_AVAILABLE" },
  { id: "av-04", nurseId: "72f0abd2-3623-4b50-a04e-5a2fe9116115", date: d("2026-06-04 00:00:00"), status: "AVAILABLE" },
  { id: "av-05", nurseId: "5a3ea5a3-336c-435b-88dd-4f32684a9f28", date: d("2026-06-05 00:00:00"), status: "AVAILABLE" },
  { id: "av-06", nurseId: "1009431d-7fce-4afa-9f8c-5f87c44c565a", date: d("2026-06-06 00:00:00"), status: "PARTIAL" },
  { id: "av-07", nurseId: "6a7cc694-c0e9-4b1c-99b0-4d32f2ce448f", date: d("2026-06-07 00:00:00"), status: "NOT_AVAILABLE" },
  { id: "av-08", nurseId: "2464e78c-b2ac-4a69-83c8-6ac2182a70d6", date: d("2026-06-08 00:00:00"), status: "AVAILABLE" },
  { id: "av-09", nurseId: "fb2227ac-8205-4436-9045-6eb0308dee5f", date: d("2026-06-09 00:00:00"), status: "AVAILABLE" },
  { id: "av-10", nurseId: "819bf95e-1797-496c-8f57-ad6bc46f5721", date: d("2026-06-10 00:00:00"), status: "PARTIAL" },
] as const;

const VACATIONS = [
  { id: "vac-01", nurseId: "3432cddc-61b2-4ead-b451-d6837d365230", startDate: d("2026-07-01 00:00:00"), endDate: d("2026-07-15 00:00:00"), status: "APPROVED", reason: "Vacaciones anuales", notes: "Aprobado por HR", departmentId: "dept-01" },
  { id: "vac-02", nurseId: "7a0ac1ba-747b-484d-8945-47e01da2d4e4", startDate: d("2026-08-10 00:00:00"), endDate: d("2026-08-25 00:00:00"), status: "PENDING_APPROVAL", reason: "Descanso", notes: "", departmentId: "dept-02" },
  { id: "vac-03", nurseId: "77d3ad03-5bc5-46b7-9368-59f97813f8d5", startDate: d("2026-09-01 00:00:00"), endDate: d("2026-09-14 00:00:00"), status: "APPROVED", reason: "Viaje familiar", notes: "", departmentId: "dept-03" },
  { id: "vac-04", nurseId: "72f0abd2-3623-4b50-a04e-5a2fe9116115", startDate: d("2026-10-05 00:00:00"), endDate: d("2026-10-20 00:00:00"), status: "APPROVED", reason: "Vacaciones anuales", notes: "", departmentId: "dept-04" },
  { id: "vac-05", nurseId: "5a3ea5a3-336c-435b-88dd-4f32684a9f28", startDate: d("2026-11-15 00:00:00"), endDate: d("2026-11-30 00:00:00"), status: "REJECTED", reason: "Choque con temporada alta", notes: "Reprogramar", departmentId: "dept-05" },
  { id: "vac-06", nurseId: "1009431d-7fce-4afa-9f8c-5f87c44c565a", startDate: d("2026-12-01 00:00:00"), endDate: d("2026-12-15 00:00:00"), status: "APPROVED", reason: "Vacaciones anuales", notes: "", departmentId: "dept-06" },
  { id: "vac-07", nurseId: "6a7cc694-c0e9-4b1c-99b0-4d32f2ce448f", startDate: d("2027-01-10 00:00:00"), endDate: d("2027-01-25 00:00:00"), status: "DRAFT", reason: "Descanso", notes: "", departmentId: "dept-07" },
  { id: "vac-08", nurseId: "2464e78c-b2ac-4a69-83c8-6ac2182a70d6", startDate: d("2027-02-05 00:00:00"), endDate: d("2027-02-20 00:00:00"), status: "PENDING_APPROVAL", reason: "Vacaciones anuales", notes: "", departmentId: "dept-08" },
  { id: "vac-09", nurseId: "fb2227ac-8205-4436-9045-6eb0308dee5f", startDate: d("2027-03-15 00:00:00"), endDate: d("2027-03-30 00:00:00"), status: "APPROVED", reason: "Viaje", notes: "", departmentId: "dept-09" },
  { id: "vac-10", nurseId: "819bf95e-1797-496c-8f57-ad6bc46f5721", startDate: d("2027-04-01 00:00:00"), endDate: d("2027-04-15 00:00:00"), status: "APPROVED", reason: "Vacaciones anuales", notes: "", departmentId: "dept-10" },
] as const;

type LeaveTypeValue = "BEREAVEMENT" | "MEDICAL" | "SICK_LEAVE" | "INJURY" | "SURGERY_RECOVERY" | "MATERNITY" | "PATERNITY" | "FAMILY_EMERGENCY" | "BEREAVMENT" | "ADMNISTRATIVE" | "SUSPENSION" | "TRAINING" | "CONFERENCE" | "PERSONAL" | "STUDY" | "RELIGIOUS" | "UNPAID" | "SICK" | "UNION";

type LeaveStatusValue = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

const LEAVES = [
  { id: "lv-01", userId: "user-01", type: "MATERNITY", startDate: d("2026-05-01 00:00:00"), endDate: d("2026-08-01 00:00:00"), reason: "Licencia pre-natal", status: "APPROVED", departmentId: "dept-01" },
  { id: "lv-02", userId: "user-02", type: "STUDY", startDate: d("2026-06-01 00:00:00"), endDate: d("2026-06-05 00:00:00"), reason: "Congreso médico", status: "APPROVED", departmentId: "dept-02" },
  { id: "lv-03", userId: "user-03", type: "BEREAVEMENT", startDate: d("2026-06-10 00:00:00"), endDate: d("2026-06-13 00:00:00"), reason: "Fallecimiento familiar", status: "APPROVED", departmentId: "dept-03" },
  { id: "lv-04", userId: "user-04", type: "UNPAID", startDate: d("2026-07-01 00:00:00"), endDate: d("2026-07-30 00:00:00"), reason: "Asuntos personales", status: "PENDING", departmentId: "dept-04" },
  { id: "lv-05", userId: "user-05", type: "PATERNITY", startDate: d("2026-08-15 00:00:00"), endDate: d("2026-08-22 00:00:00"), reason: "Nacimiento hijo", status: "APPROVED", departmentId: "dept-05" },
  { id: "lv-06", userId: "user-06", type: "SICK", startDate: d("2026-06-05 00:00:00"), endDate: d("2026-06-25 00:00:00"), reason: "Cirugía menor", status: "APPROVED", departmentId: "dept-06" },
  { id: "lv-07", userId: "user-07", type: "UNION", startDate: d("2026-06-15 00:00:00"), endDate: d("2026-06-16 00:00:00"), reason: "Reunión sindical", status: "APPROVED", departmentId: "dept-07" },
  { id: "lv-08", userId: "user-08", type: "STUDY", startDate: d("2026-09-01 00:00:00"), endDate: d("2026-12-01 00:00:00"), reason: "Diplomado especialización", status: "PENDING", departmentId: "dept-08" },
  { id: "lv-09", userId: "user-09", type: "UNPAID", startDate: d("2026-10-01 00:00:00"), endDate: d("2026-10-15 00:00:00"), reason: "Viaje personal", status: "REJECTED", departmentId: "dept-09" },
  { id: "lv-10", userId: "user-10", type: "BEREAVEMENT", startDate: d("2026-05-20 00:00:00"), endDate: d("2026-05-23 00:00:00"), reason: "Fallecimiento", status: "APPROVED", departmentId: "dept-10" },
] as const;

// ============================================================================
// 9.5. MÉTRICAS DE CARGA DE TRABAJO (WorkLoadMetrics)
// ============================================================================
// No hay datos en DummyData.sql para esta tabla; se insertan datos de ejemplo
// para el mes 6 (junio) de 2026, uno por enfermera. La idempotencia se logra
// con upsert por el id fijo.

const WORKLOAD_METRICS = [
  { id: "wlm-01", nurseId: "3432cddc-61b2-4ead-b451-d6837d365230", month: 6, year: 2026, total_hours: 160, overtime_hours: 0, regular_hours: 160, nigth_hours: 40, weekend_hours: 16, holidy_hours: 0, emergency_hours: 0, fatigue_score: 0.3, fairness_score: 0.8, workload_score: 0.75, burnout_risk: 0.2 },
  { id: "wlm-02", nurseId: "7a0ac1ba-747b-484d-8945-47e01da2d4e4", month: 6, year: 2026, total_hours: 150, overtime_hours: 10, regular_hours: 140, nigth_hours: 20, weekend_hours: 8, holidy_hours: 0, emergency_hours: 2, fatigue_score: 0.4, fairness_score: 0.7, workload_score: 0.7, burnout_risk: 0.3 },
  { id: "wlm-03", nurseId: "77d3ad03-5bc5-46b7-9368-59f97813f8d5", month: 6, year: 2026, total_hours: 140, overtime_hours: 5, regular_hours: 135, nigth_hours: 30, weekend_hours: 12, holidy_hours: 0, emergency_hours: 1, fatigue_score: 0.35, fairness_score: 0.75, workload_score: 0.65, burnout_risk: 0.25 },
  { id: "wlm-04", nurseId: "72f0abd2-3623-4b50-a04e-5a2fe9116115", month: 6, year: 2026, total_hours: 170, overtime_hours: 20, regular_hours: 150, nigth_hours: 50, weekend_hours: 20, holidy_hours: 0, emergency_hours: 5, fatigue_score: 0.6, fairness_score: 0.6, workload_score: 0.85, burnout_risk: 0.5 },
  { id: "wlm-05", nurseId: "5a3ea5a3-336c-435b-88dd-4f32684a9f28", month: 6, year: 2026, total_hours: 120, overtime_hours: 0, regular_hours: 120, nigth_hours: 0, weekend_hours: 4, holidy_hours: 0, emergency_hours: 0, fatigue_score: 0.2, fairness_score: 0.85, workload_score: 0.6, burnout_risk: 0.15 },
  { id: "wlm-06", nurseId: "1009431d-7fce-4afa-9f8c-5f87c44c565a", month: 6, year: 2026, total_hours: 100, overtime_hours: 0, regular_hours: 100, nigth_hours: 0, weekend_hours: 0, holidy_hours: 0, emergency_hours: 0, fatigue_score: 0.25, fairness_score: 0.7, workload_score: 0.5, burnout_risk: 0.2 },
  { id: "wlm-07", nurseId: "6a7cc694-c0e9-4b1c-99b0-4d32f2ce448f", month: 6, year: 2026, total_hours: 180, overtime_hours: 30, regular_hours: 150, nigth_hours: 60, weekend_hours: 24, holidy_hours: 0, emergency_hours: 10, fatigue_score: 0.7, fairness_score: 0.5, workload_score: 0.9, burnout_risk: 0.6 },
  { id: "wlm-08", nurseId: "2464e78c-b2ac-4a69-83c8-6ac2182a70d6", month: 6, year: 2026, total_hours: 130, overtime_hours: 15, regular_hours: 115, nigth_hours: 10, weekend_hours: 6, holidy_hours: 0, emergency_hours: 3, fatigue_score: 0.45, fairness_score: 0.65, workload_score: 0.7, burnout_risk: 0.35 },
  { id: "wlm-09", nurseId: "fb2227ac-8205-4436-9045-6eb0308dee5f", month: 6, year: 2026, total_hours: 155, overtime_hours: 5, regular_hours: 150, nigth_hours: 25, weekend_hours: 10, holidy_hours: 0, emergency_hours: 2, fatigue_score: 0.38, fairness_score: 0.72, workload_score: 0.72, burnout_risk: 0.28 },
  { id: "wlm-10", nurseId: "819bf95e-1797-496c-8f57-ad6bc46f5721", month: 6, year: 2026, total_hours: 145, overtime_hours: 10, regular_hours: 135, nigth_hours: 35, weekend_hours: 14, holidy_hours: 0, emergency_hours: 4, fatigue_score: 0.42, fairness_score: 0.68, workload_score: 0.78, burnout_risk: 0.32 },
  { id: "wlm-11", nurseId: "0b992205-074a-46a2-befe-28521aabe60c", month: 6, year: 2026, total_hours: 160, overtime_hours: 0, regular_hours: 160, nigth_hours: 40, weekend_hours: 16, holidy_hours: 0, emergency_hours: 0, fatigue_score: 0.3, fairness_score: 0.8, workload_score: 0.75, burnout_risk: 0.2 },
  { id: "wlm-12", nurseId: "ef716d9f-87aa-4c13-bed9-727b767e8206", month: 6, year: 2026, total_hours: 100, overtime_hours: 0, regular_hours: 100, nigth_hours: 0, weekend_hours: 0, holidy_hours: 0, emergency_hours: 0, fatigue_score: 0.2, fairness_score: 0.85, workload_score: 0.55, burnout_risk: 0.15 },
  { id: "wlm-13", nurseId: "c17676f2-7d22-461f-bfcd-b70fc7152f7b", month: 6, year: 2026, total_hours: 90, overtime_hours: 0, regular_hours: 90, nigth_hours: 0, weekend_hours: 0, holidy_hours: 0, emergency_hours: 0, fatigue_score: 0.18, fairness_score: 0.88, workload_score: 0.5, burnout_risk: 0.12 },
  { id: "wlm-14", nurseId: "1018875c-ceaa-4b0b-b72d-f8d38be1e506", month: 6, year: 2026, total_hours: 170, overtime_hours: 20, regular_hours: 150, nigth_hours: 55, weekend_hours: 18, holidy_hours: 0, emergency_hours: 6, fatigue_score: 0.62, fairness_score: 0.58, workload_score: 0.88, burnout_risk: 0.52 },
  { id: "wlm-15", nurseId: "18e7f2b1-febc-4a62-9edc-107d23e33a13", month: 6, year: 2026, total_hours: 150, overtime_hours: 10, regular_hours: 140, nigth_hours: 30, weekend_hours: 10, holidy_hours: 0, emergency_hours: 3, fatigue_score: 0.38, fairness_score: 0.72, workload_score: 0.7, burnout_risk: 0.28 },
  { id: "wlm-16", nurseId: "9af6b81f-10a0-4cbb-bd8f-eaa31077de6e", month: 6, year: 2026, total_hours: 80, overtime_hours: 0, regular_hours: 80, nigth_hours: 0, weekend_hours: 0, holidy_hours: 0, emergency_hours: 0, fatigue_score: 0.15, fairness_score: 0.9, workload_score: 0.45, burnout_risk: 0.1 },
  { id: "wlm-17", nurseId: "c99421f2-4a31-4806-9a0b-afbbc02bbe18", month: 6, year: 2026, total_hours: 90, overtime_hours: 0, regular_hours: 90, nigth_hours: 0, weekend_hours: 0, holidy_hours: 0, emergency_hours: 0, fatigue_score: 0.2, fairness_score: 0.85, workload_score: 0.5, burnout_risk: 0.15 },
  { id: "wlm-18", nurseId: "102fb448-4481-4fa4-8b31-ffcfb5798064", month: 6, year: 2026, total_hours: 140, overtime_hours: 5, regular_hours: 135, nigth_hours: 25, weekend_hours: 8, holidy_hours: 0, emergency_hours: 1, fatigue_score: 0.32, fairness_score: 0.75, workload_score: 0.65, burnout_risk: 0.22 },
  { id: "wlm-19", nurseId: "1d5e33d1-1cd9-439d-bd5a-cb0722dadd91", month: 6, year: 2026, total_hours: 130, overtime_hours: 0, regular_hours: 130, nigth_hours: 20, weekend_hours: 6, holidy_hours: 0, emergency_hours: 0, fatigue_score: 0.3, fairness_score: 0.78, workload_score: 0.68, burnout_risk: 0.2 },
  { id: "wlm-20", nurseId: "9b998b31-63bd-4bcb-9296-0f84444f696d", month: 6, year: 2026, total_hours: 155, overtime_hours: 5, regular_hours: 150, nigth_hours: 45, weekend_hours: 12, holidy_hours: 0, emergency_hours: 2, fatigue_score: 0.45, fairness_score: 0.7, workload_score: 0.78, burnout_risk: 0.35 },
] as const;

// ============================================================================
// 9. PERMISOS Y ROLE_PERMISSIONS
// ============================================================================
// Se sincronizan:
//   a) Los permisos que declara la app (PERMISSIONS constants) -> descripción autogenerada.
//   b) Los 105 permisos de DummyData.sql -> descripción textual del SQL.
// Los permisos del SQL tienen prioridad en la descripción cuando coinciden.

const DUMMY_PERMISSIONS = [
  { id: "perm-01", name: "CREATE_SCHEDULE", description: "Permite generar horarios" },
  { id: "perm-02", name: "EDIT_SCHEDULE", description: "Permite modificar turnos" },
  { id: "perm-03", name: "APPROVE_VACATION", description: "Aprobar vacaciones" },
  { id: "perm-04", name: "VIEW_REPORTS", description: "Ver métricas y reportes" },
  { id: "perm-05", name: "MANAGE_USERS", description: "Crear y editar usuarios" },
  { id: "perm-06", name: "MANAGE_ROLES", description: "Configurar roles" },
  { id: "perm-07", name: "OVERRIDE_RULES", description: "Saltarse advertencias del sistema" },
  { id: "perm-08", name: "APPROVE_SWAPS", description: "Aprobar cambios de turno" },
  { id: "perm-09", name: "VIEW_ALL_DEPARTMENTS", description: "Visibilidad global" },
  { id: "perm-10", name: "EXPORT_DATA", description: "Exportar a Excel/PDF" },
  { id: "perm-11", name: "WRITE_AUDIT_LOGS", description: "Registrar eventos en la bitácora de auditoría del sistema" },
  { id: "perm-12", name: "READ_AUDIT_LOGS", description: "Consultar y leer registros de auditoría" },
  { id: "perm-13", name: "CREATE_USER", description: "Registrar nuevos usuarios en el sistema" },
  { id: "perm-14", name: "CHANGE_PASSWORD", description: "Modificar o resetear contraseñas de usuarios" },
  { id: "perm-15", name: "CREATE_BRANCH", description: "Crear nuevas sucursales o sedes" },
  { id: "perm-16", name: "VIEW_BRANCHES", description: "Ver el listado completo de sucursales" },
  { id: "perm-17", name: "VIEW_BRANCH", description: "Ver los detalles de una sucursal específica" },
  { id: "perm-18", name: "UPDATE_BRANCH", description: "Modificar la información de una sucursal" },
  { id: "perm-19", name: "DELETE_BRANCH", description: "Eliminar o desactivar una sucursal" },
  { id: "perm-20", name: "CREATE_DEPARTMENT", description: "Registrar nuevos departamentos o áreas" },
  { id: "perm-21", name: "VIEW_DEPARTMENTS", description: "Ver el listado completo de departamentos" },
  { id: "perm-22", name: "VIEW_DEPARTMENT", description: "Ver los detalles de un departamento específico" },
  { id: "perm-23", name: "UPDATE_DEPARTMENT", description: "Modificar la configuración de un departamento" },
  { id: "perm-24", name: "DELETE_DEPARTMENT", description: "Eliminar o archivar un departamento" },
  { id: "perm-25", name: "ASSIGN_NURSES_DEPARTMENT", description: "Asignar personal de enfermería a departamentos" },
  { id: "perm-26", name: "CREATE_EMERGENCY_CANDIDATE", description: "Registrar personal disponible para coberturas de emergencia" },
  { id: "perm-27", name: "VIEW_EMERGENCY_CANDIDATES", description: "Ver lista de candidatos para turnos de emergencia" },
  { id: "perm-28", name: "UPDATE_EMERGENCY_CANDIDATE", description: "Actualizar estatus de candidatos de emergencia" },
  { id: "perm-29", name: "MANAGE_FEATURE_FLAGS", description: "Activar o desactivar características globales del sistema" },
  { id: "perm-30", name: "VIEW_FEATURE_FLAGS", description: "Ver el estado de las características del sistema (Feature Flags)" },
  { id: "perm-31", name: "MANAGE_SYSTEM_MODULES", description: "Administrar la disponibilidad de los módulos del sistema" },
  { id: "perm-32", name: "VIEW_SYSTEM_MODULES", description: "Ver el estado y configuración de los módulos del sistema" },
  { id: "perm-33", name: "CREATE_LEAVE", description: "Registrar permisos médicos, licencias o ausencias" },
  { id: "perm-34", name: "VIEW_LEAVES", description: "Ver historial y solicitudes de ausencias" },
  { id: "perm-35", name: "UPDATE_LEAVE", description: "Modificar, aprobar o rechazar solicitudes de ausencia" },
  { id: "perm-36", name: "CREATE_NOTIFICATION_TEMPLATE", description: "Crear nuevas plantillas para correos/SMS/Push" },
  { id: "perm-37", name: "FIND_ALL_NOTIFICATIONS_TEMPLATES", description: "Ver el listado de plantillas de notificación" },
  { id: "perm-38", name: "FIND_ONE_NOTIFICATION_TEMPLATE", description: "Ver configuración de una plantilla de notificación" },
  { id: "perm-39", name: "UPDATE_NOTIFICATION_TEMPLATE", description: "Modificar texto o variables de una plantilla de notificación" },
  { id: "perm-40", name: "DELETE_NOTIFICATION_TEMPLATE", description: "Eliminar plantillas de notificación" },
  { id: "perm-41", name: "CREATE_NURSE_AVAILABILITY", description: "Registrar bloqueos o disponibilidad del personal" },
  { id: "perm-42", name: "VIEW_NURSE_AVAILABILITY", description: "Consultar disponibilidad general de enfermeras" },
  { id: "perm-43", name: "UPDATE_NURSE_AVAILABILITY", description: "Ajustar la disponibilidad o preferencias de turnos" },
  { id: "perm-44", name: "CREATE_NURSE_PROFILE", description: "Crear expediente y perfil técnico de enfermería" },
  { id: "perm-45", name: "VIEW_NURSE_PROFILES", description: "Ver listado de perfiles técnicos" },
  { id: "perm-46", name: "VIEW_NURSE_PROFILE", description: "Ver expediente completo de una enfermera" },
  { id: "perm-47", name: "UPDATE_NURSE_PROFILE", description: "Modificar certificaciones, notas o datos del perfil" },
  { id: "perm-48", name: "CREATE_NURSE_RESTRICTION", description: "Aplicar una regla o restricción temporal/permanente a un recurso" },
  { id: "perm-49", name: "VIEW_NURSE_RESTRICTIONS", description: "Ver las restricciones laborales activas" },
  { id: "perm-50", name: "UPDATE_NURSE_RESTRICTION", description: "Modificar vigencia o tipo de restricción laboral" },
  { id: "perm-51", name: "DELETE_NURSE_RESTRICTION", description: "Levantar o eliminar una restricción laboral" },
  { id: "perm-52", name: "CREATE_NURSE", description: "Dar de alta a un nuevo empleado de enfermería" },
  { id: "perm-53", name: "VIEW_NURSES", description: "Consultar el padrón general de enfermeras" },
  { id: "perm-54", name: "VIEW_NURSE", description: "Ver datos básicos laborales de la enfermera" },
  { id: "perm-55", name: "UPDATE_NURSE", description: "Actualizar estatus, contrato o tipo de recurso" },
  { id: "perm-56", name: "DELETE_NURSE", description: "Dar de baja a un empleado de enfermería" },
  { id: "perm-57", name: "VIEW_OPERATIONAL_ALERTS", description: "Ver alertas de cobertura, fatiga o faltas de personal" },
  { id: "perm-58", name: "RESOLVE_OPERATIONAL_ALERTS", description: "Reconocer o marcar alertas operativas como resueltas" },
  { id: "perm-59", name: "EXECUTE_SCHEDULE_OPTIMIZATION", description: "Lanzar el motor algorítmico para generar o mejorar horarios" },
  { id: "perm-60", name: "VIEW_OPTIMIZATION_METRICS", description: "Ver rendimiento y puntajes del motor de distribución" },
  { id: "perm-61", name: "CREATE_OPTIMIZATION_SCORE", description: "Definir nuevas reglas de peso para el algoritmo" },
  { id: "perm-62", name: "VIEW_OPTIMIZATION_SCORES", description: "Consultar las reglas y pesos de asignación algorítmica" },
  { id: "perm-63", name: "UPDATE_OPTIMIZATION_SCORE", description: "Calibrar los pesos e importancia de las reglas de turnos" },
  { id: "perm-64", name: "CREATE_ORGANIZATION_SETTINGS", description: "Inicializar configuración global de la organización" },
  { id: "perm-65", name: "VIEW_ORGANIZATION_SETTINGS", description: "Ver reglas de negocio globales (horas máximas, etc.)" },
  { id: "perm-66", name: "UPDATE_ORGANIZATION_SETTINGS", description: "Modificar parámetros globales de la institución" },
  { id: "perm-67", name: "CREATE-ORGANIZATION", description: "Registrar una nueva entidad/hospital cliente" },
  { id: "perm-68", name: "READ_ORGANIZATION", description: "Ver información fiscal y general del hospital" },
  { id: "perm-69", name: "UPDATE-ORGANIZATION", description: "Actualizar datos de la razón social del hospital" },
  { id: "perm-70", name: "CREATE_SCHEDULE_ENTRY", description: "Asignar un turno a un empleado específico manualmente" },
  { id: "perm-71", name: "VIEW_SCHEDULE_ENTRIES", description: "Ver la matriz de asignaciones de turnos" },
  { id: "perm-72", name: "UPDATE_SCHEDULE_ENTRY", description: "Mover, reasignar o modificar horas de un turno asignado" },
  { id: "perm-73", name: "PUBLISH_SCHEDULE", description: "Liberar el horario borrador para vista de los empleados" },
  { id: "perm-75", name: "VIEW_SCHEDULES", description: "Ver el listado histórico de programaciones" },
  { id: "perm-76", name: "VIEW_SCHEDULE", description: "Abrir la vista completa de una programación específica" },
  { id: "perm-77", name: "UPDATE_SCHEDULE", description: "Modificar periodo, estatus o metadata del bloque de horario" },
  { id: "perm-78", name: "DELETE_SCHEDULE", description: "Descartar o eliminar un horario completo" },
  { id: "perm-79", name: "GENERATE_SCHEDULE", description: "Disparar el autollenado de celdas según plantillas" },
  { id: "perm-80", name: "REQUEST_SHIFT_CHG", description: "Pedir un cambio de guardia a un compañero" },
  { id: "perm-81", name: "VIEW_SHIFT_CHG", description: "Ver el panel de solicitudes de intercambio de turnos" },
  { id: "perm-82", name: "APPROVE_SHIFT_CHG", description: "Autorizar o denegar intercambios entre enfermeras" },
  { id: "perm-83", name: "CREATE_SHIFT_CHANGE_DOCUMENT", description: "Generar formato formal/PDF para el intercambio de turnos" },
  { id: "perm-84", name: "VIEW_ALL_SHIFT_CHANGE_DOCUMENT", description: "Ver archivo de formatos de cambio de turnos" },
  { id: "perm-85", name: "VIEW_SHIFT_CHANGE_DOCUMENT", description: "Ver un acta específica de cambio de guardia" },
  { id: "perm-86", name: "UPDATE_SHIFT_CHANGE_DOCUMENT", description: "Modificar firmas o detalles del acta de cambio" },
  { id: "perm-87", name: "VERIFY_SHIFT_CHANGE_DOCUMENT", description: "Aplicar firma o validación legal al intercambio" },
  { id: "perm-88", name: "DELETE_SHIFT_CHANGE_DOCUMENT", description: "Anular el acta formal de cambio de turno" },
  { id: "perm-89", name: "CREATE_SHIFT", description: "Crear una nueva plantilla de turno (ej. Mañana 8h, Noche 12h)" },
  { id: "perm-90", name: "VIEW_SHIFTS", description: "Ver el catálogo maestro de tipos de turnos" },
  { id: "perm-91", name: "VIEW_SHIFT", description: "Ver detalles de horas y reglas de un turno específico" },
  { id: "perm-92", name: "UPDATE_SHIFT", description: "Modificar duración, horas o color de un turno base" },
  { id: "perm-93", name: "DELETE_SHIFT", description: "Desactivar o eliminar un turno del catálogo maestro" },
  { id: "perm-94", name: "CREATE_VACATION", description: "Registrar una solicitud de bloque vacacional" },
  { id: "perm-95", name: "VIEW_VACATIONS", description: "Ver todas las solicitudes de vacaciones del personal" },
  { id: "perm-96", name: "VIEW_VACATION", description: "Detalle y fechas de una solicitud vacacional específica" },
  { id: "perm-97", name: "UPDATE_VACATION", description: "Editar periodo de vacaciones solicitadas o estado" },
  { id: "perm-98", name: "DELETE_VACATION", description: "Cancelar o eliminar bloque de vacaciones programadas" },
  { id: "perm-99", name: "WRITE_WEBHOOK_LOGS", description: "Registrar eventos de salida hacia integraciones externas" },
  { id: "perm-100", name: "READ_WEBHOOK_LOGS", description: "Leer historial de peticiones de webhooks enviados/recibidos" },
  { id: "perm-101", name: "MANAGE_WEBHOOKS", description: "Configurar URLs y secret keys de sistemas externos" },
  { id: "perm-102", name: "CREATE_WORKLOAD_METRICS", description: "Registrar puntos estadísticos de saturación de pacientes" },
  { id: "perm-103", name: "VIEW_WORKLOAD_METRICS", description: "Ver los índices de fatiga y saturación del personal" },
  { id: "perm-104", name: "VIEW_CLINICAL_ANALYTICS", description: "Acceder a dashboards ejecutivos de cobertura clínica" },
  { id: "perm-105", name: "CREATE_VACATION_POLICY", description: "Crear nueva política de vacaciones" },
  { id: "perm-106", name: "VIEW_VACATION_POLICIES", description: "Ver todas las políticas de vacaciones del sistema" },
  { id: "perm-107", name: "VIEW_VACATION_POLICY", description: "Ver el detalle de una política de vacaciones" },
  { id: "perm-108", name: "MANAGE_VACATION_POLICIES", description: "Gestionar (editar, archivar) políticas de vacaciones" },
  { id: "perm-109", name: "ACTIVATE_VACATION_POLICY", description: "Activar una política de vacaciones (previa validación de RR.HH.)" },
  { id: "perm-110", name: "ASSIGN_VACATION_POLICY", description: "Asignar política de vacaciones a una enfermera" },
  { id: "perm-111", name: "SIMULATE_VACATION_POLICY", description: "Simular derechos de vacaciones de una enfermera" },
  { id: "perm-112", name: "CREATE_DOCUMENT_TEMPLATE", description: "Crear plantillas de documentos institucionales" },
  { id: "perm-113", name: "VIEW_DOCUMENT_TEMPLATES", description: "Ver plantillas de documentos del sistema" },
  { id: "perm-114", name: "MANAGE_DOCUMENT_TEMPLATES", description: "Editar, activar, versionar y archivar plantillas de documentos" },
  { id: "perm-115", name: "GENERATE_DOCUMENT", description: "Generar documentos a partir de plantillas con datos del sistema" },
  { id: "perm-116", name: "VIEW_DOCUMENTS", description: "Consultar documentos generados y su historial" },
  { id: "perm-117", name: "DOWNLOAD_DOCUMENT", description: "Descargar copias de documentos generados" },
  { id: "perm-118", name: "VOID_DOCUMENT", description: "Anular documentos generados (conserva copia y auditoría)" }
];

interface WorkRuleSeed {
  id: string;
  code: string;
  name: string;
  type: WorkRuleTypes;
  description: string
  value: string;
}

const WORK_RULES: WorkRuleSeed[] = [
  { id: "wr-R001", code: "R001", name: "No permitir turno noche seguido de mañana", type: "HARD", description: "Una enfermera no puede hacer amanecida y trabajar la mañana siguiente", value: "true" },
  { id: "wr-R002", code: "R002", name: "Validar horas máximas mensuales", type: "HARD", description: "El sistema no debe exceder el límite configurado", value: "160" },
  { id: "wr-R003", code: "R003", name: "Validar mínimo de días libres mensuales", type: "HARD", description: "Garantizar cantidad mínima de descansos", value: "4" },
  { id: "wr-R004", code: "R004", name: "Validar descanso mínimo entre turnos", type: "HARD", description: "Debe existir cierta cantidad de horas entre turnos", value: "12" },
  { id: "wr-R005", code: "R005", name: "Balancear turnos nocturnos", type: "SOFT", description: "Distribuir noches equitativamente", value: "true" },
  { id: "wr-R006", code: "R006", name: "Balancear fines de semana", type: "SOFT", description: "Evitar sobrecargar mismos empleados", value: "true" },
  { id: "wr-R007", code: "R007", name: "No exceder cantidad máxima de noches", type: "HARD", description: "Limitar noches consecutivas o mensuales", value: "3" },
  { id: "wr-R008", code: "R008", name: "Permitir horarios especiales por departamento", type: "CONFIGURABLE", description: "Cada área puede manejar reglas diferentes", value: "true" },
  { id: "wr-R009", code: "R009", name: "Validar cantidad mínima de personal por turno", type: "HARD", description: "Nunca dejar turno descubierto", value: "1" },
  { id: "wr-R010", code: "R010", name: "Permitir plantillas de horarios reutilizables", type: "CONFIGURABLE", description: "Crear modelos predefinidos", value: "true" },
  { id: "wr-R011", code: "R011", name: "Definir duración distinta por tipo de turno", type: "CONFIGURABLE", description: "Día = 7h, Noche = 10h", value: "true" },
  { id: "wr-R012", code: "R012", name: "Permitir horarios rotativos", type: "CONFIGURABLE", description: "Rotación automática configurable", value: "true" },
  { id: "wr-R013", code: "R013", name: "Permitir horarios fijos", type: "CONFIGURABLE", description: "Personal fijo en ciertos turnos", value: "true" },
  { id: "wr-R014", code: "R014", name: "Validar compatibilidad entre turnos consecutivos", type: "HARD", description: "Evitar combinaciones inválidas", value: "true" },
  { id: "wr-R015", code: "R015", name: "Evitar exceso de días consecutivos trabajados", type: "HARD", description: "Limitar jornadas consecutivas", value: "5" },
  { id: "wr-R016", code: "R016", name: "Validar cobertura mínima por especialidad", type: "HARD", description: "Garantizar personal capacitado por área", value: "true" },
  { id: "wr-R017", code: "R017", name: "Día de cumpleaños libre", type: "SOFT", description: "Asignar libre automático", value: "true" },
  { id: "wr-R018", code: "R018", name: "Permitir preferencias personales", type: "SOFT", description: "Preferencias de horarios", value: "true" },
  { id: "wr-R019", code: "R019", name: "Dar libre por estudios", type: "SOFT", description: "Basado en documentación aprobada", value: "true" },
  { id: "wr-R020", code: "R020", name: "Balancear carga laboral", type: "SOFT", description: "Distribuir trabajo equitativamente", value: "true" },
  { id: "wr-R021", code: "R021", name: "Evitar favoritismo", type: "SOFT", description: "Mostrar métricas transparentes", value: "true" },
  { id: "wr-R022", code: "R022", name: "Considerar antigüedad", type: "CONFIGURABLE", description: "Reglas especiales por experiencia", value: "true" },
  { id: "wr-R023", code: "R023", name: "Considerar restricciones médicas", type: "HARD", description: "Evitar asignaciones incompatibles", value: "true" },
  { id: "wr-R024", code: "R024", name: "Permitir bloqueo manual de fechas", type: "CONFIGURABLE", description: "Días no disponibles", value: "true" },
  { id: "wr-R025", code: "R025", name: "Excluir personal de vacaciones", type: "HARD", description: "No asignar durante vacaciones", value: "true" },
  { id: "wr-R026", code: "R026", name: "Excluir personal con licencia", type: "HARD", description: "No asignar durante permisos", value: "true" },
  { id: "wr-R027", code: "R027", name: "Validar solapamiento de vacaciones", type: "HARD", description: "Evitar demasiadas ausencias simultáneas", value: "true" },
  { id: "wr-R028", code: "R028", name: "Recalcular listas automáticamente ante ausencias", type: "EVENT", description: "Ajustar horarios afectados", value: "true" },
  { id: "wr-R029", code: "R029", name: "Generar alertas por falta de cobertura", type: "EVENT", description: "Detectar vacíos operacionales", value: "true" },
  { id: "wr-R030", code: "R030", name: "Permitir reemplazos temporales", type: "CONFIGURABLE", description: "Cobertura provisional", value: "true" },
  { id: "wr-R031", code: "R031", name: "Requerir aprobación de supervisora", type: "HARD", description: "Cambios no automáticos", value: "true" },
  { id: "wr-R032", code: "R032", name: "Registrar justificación del cambio", type: "HARD", description: "Mantener trazabilidad", value: "true" },
  { id: "wr-R033", code: "R033", name: "Generar evidencia digital del cambio", type: "HARD", description: "Historial auditable", value: "true" },
  { id: "wr-R034", code: "R034", name: "Validar impacto operacional del cambio", type: "HARD", description: "No afectar cobertura", value: "true" },
  { id: "wr-R035", code: "R035", name: "Notificar automáticamente a involucrados", type: "EVENT", description: "Alertas inmediatas", value: "true" },
  { id: "wr-R036", code: "R036", name: "Permitir rechazo de solicitudes", type: "CONFIGURABLE", description: "Flujo de aprobación", value: "true" },
  { id: "wr-R037", code: "R037", name: "Mantener historial completo de cambios", type: "HARD", description: "Auditoría interna", value: "true" },
  { id: "wr-R038", code: "R038", name: "Detectar ausencia inesperada", type: "EVENT", description: "Activar flujo urgente", value: "true" },
  { id: "wr-R039", code: "R039", name: "Buscar personal disponible automáticamente", type: "EVENT", description: "Sugerir candidatos", value: "true" },
  { id: "wr-R040", code: "R040", name: "Permitir personal de otros departamentos", type: "CONFIGURABLE", description: "Redistribución interna", value: "true" },
  { id: "wr-R041", code: "R041", name: "Validar que departamento origen no quede vacío", type: "HARD", description: "Mantener equilibrio", value: "true" },
  { id: "wr-R042", code: "R042", name: "Priorizar personal con menos carga", type: "SOFT", description: "Balancear trabajo", value: "true" },
  { id: "wr-R043", code: "R043", name: "Notificar solicitudes urgentes", type: "EVENT", description: "Cobertura rápida", value: "true" },
  { id: "wr-R044", code: "R044", name: "Permitir aceptación desde celular", type: "CONFIGURABLE", description: "Respuesta inmediata", value: "true" },
  { id: "wr-R045", code: "R045", name: "Calcular horas automáticamente", type: "HARD", description: "Basado en tipo de turno", value: "true" },
  { id: "wr-R046", code: "R046", name: "Diferenciar horas día/noche", type: "HARD", description: "Día 7h / Noche 10h", value: "true" },
  { id: "wr-R047", code: "R047", name: "Mostrar horas acumuladas mensuales", type: "CONFIGURABLE", description: "Seguimiento individual", value: "true" },
  { id: "wr-R048", code: "R048", name: "Detectar exceso de horas", type: "HARD", description: "Alertas automáticas", value: "true" },
  { id: "wr-R049", code: "R049", name: "Detectar déficit de horas", type: "SOFT", description: "Balance mensual", value: "true" },
  { id: "wr-R050", code: "R050", name: "Calcular horas extras", type: "CONFIGURABLE", description: "Gestión administrativa", value: "true" },
  { id: "wr-R051", code: "R051", name: "Registrar todas las modificaciones", type: "HARD", description: "Auditoría completa", value: "true" },
  { id: "wr-R052", code: "R052", name: "Registrar quién aprobó cambios", type: "HARD", description: "Trazabilidad", value: "true" },
  { id: "wr-R053", code: "R053", name: "Mantener historial de listas mensuales", type: "HARD", description: "Consulta futura", value: "true" },
  { id: "wr-R054", code: "R054", name: "Control de permisos por rol", type: "HARD", description: "Seguridad operacional", value: "true" },
  { id: "wr-R055", code: "R055", name: "Bloquear edición de listas publicadas", type: "CONFIGURABLE", description: "Evitar cambios indebidos", value: "true" },
  { id: "wr-R056", code: "R056", name: "Configuración por hospital", type: "CONFIGURABLE", description: "Reglas independientes", value: "true" },
  { id: "wr-R057", code: "R057", name: "Configuración por departamento", type: "CONFIGURABLE", description: "Personalización por área", value: "true" },
  { id: "wr-R058", code: "R058", name: "Configuración de tipos de turno", type: "CONFIGURABLE", description: "Ajuste flexible", value: "true" },
  { id: "wr-R059", code: "R059", name: "Configuración de límites laborales", type: "CONFIGURABLE", description: "Adaptación legal", value: "true" },
  { id: "wr-R060", code: "R060", name: "Activar/desactivar reglas específicas", type: "CONFIGURABLE", description: "Flexibilidad total", value: "true" },
  { id: "wr-R061", code: "R061", name: "Sugerir horarios óptimos automáticamente", type: "SOFT", description: "IA de optimización", value: "true" },
  { id: "wr-R062", code: "R062", name: "Detectar patrones de sobrecarga", type: "SOFT", description: "Prevención de fatiga", value: "true" },
  { id: "wr-R063", code: "R063", name: "Predecir ausencias frecuentes", type: "SOFT", description: "Analítica predictiva", value: "true" },
  { id: "wr-R064", code: "R064", name: "Recomendar mejor reemplazo", type: "SOFT", description: "Matching inteligente", value: "true" },
  { id: "wr-R065", code: "R065", name: "Detectar posibles conflictos futuros", type: "SOFT", description: "Prevención operacional", value: "true" },
  { id: "wr-R066", code: "R066", name: "Validar disponibilidad antes de asignar", type: "HARD", description: "Evitar conflictos", value: "true" },
  { id: "wr-R067", code: "R067", name: "Permitir múltiples sedes", type: "CONFIGURABLE", description: "Multi-hospital", value: "true" },
  { id: "wr-R068", code: "R068", name: "Permitir múltiples contratos por empleado", type: "CONFIGURABLE", description: "Personal multi-área", value: "true" },
  { id: "wr-R069", code: "R069", name: "Detectar conflictos entre múltiples empleos", type: "SOFT", description: "Compatibilidad externa", value: "true" },
  { id: "wr-R070", code: "R070", name: "Permitir bloqueos administrativos", type: "CONFIGURABLE", description: "Eventos especiales", value: "true" },
  { id: "wr-R071", code: "R071", name: "Permitir suspensión temporal de empleados", type: "CONFIGURABLE", description: "Gestión interna", value: "true" },
  { id: "wr-R072", code: "R072", name: "Validar personal mínimo por género/especialidad", type: "CONFIGURABLE", description: "Reglas específicas", value: "true" },
  { id: "wr-R073", code: "R073", name: "Permitir asignaciones manuales prioritarias", type: "CONFIGURABLE", description: "Control supervisor", value: "true" },
  { id: "wr-R074", code: "R074", name: "Permitir publicación programada de listas", type: "CONFIGURABLE", description: "Automatización", value: "true" },
  { id: "wr-R075", code: "R075", name: "Generar reportes operacionales automáticos", type: "CONFIGURABLE", description: "Gestión administrativa", value: "true" },
];

const RULES_EXCLUDED_FROM_ADMIN_CONDITION = new Set([
  "R001", "R002", "R003", "R004", "R007", "R015", "R025", "R026", "R066",
]);

// Reglas explícitas de condiciones (el resto se genera como ADMIN_INTERACTION_REQUIRED/desactivadas)
const WORK_RULE_CONDITIONS_EXPLICIT = [
  { id: "wrc-R001", workRuleId: "wr-R001", condition_type: "ILLEGAL_SHIFT_TRANSITION", operator: "EQUALS", value: "true", logical_group: "GROUP_MAIN", priority: 1, enabled: true },
  { id: "wrc-R002", workRuleId: "wr-R002", condition_type: "TOTAL_HOURS", operator: "GREATER_THAN", value: "160", logical_group: "GROUP_MAIN", priority: 1, enabled: true },
  { id: "wrc-R003", workRuleId: "wr-R003", condition_type: "MIN_DAYS_OFF", operator: "LESS_THAN", value: "4", logical_group: "GROUP_MAIN", priority: 1, enabled: false },
  { id: "wrc-R004", workRuleId: "wr-R004", condition_type: "REST_HOURS", operator: "LESS_THAN", value: "12", logical_group: "GROUP_MAIN", priority: 1, enabled: true },
  { id: "wrc-R007", workRuleId: "wr-R007", condition_type: "CONSECUTIVE_NIGHTS", operator: "GREATER_THAN", value: "3", logical_group: "GROUP_MAIN", priority: 1, enabled: true },
  { id: "wrc-R015", workRuleId: "wr-R015", condition_type: "CONSECUTIVE_DAYS", operator: "GREATER_THAN", value: "5", logical_group: "GROUP_MAIN", priority: 1, enabled: true },
  { id: "wrc-R025", workRuleId: "wr-R025", condition_type: "IS_ON_VACATION", operator: "EQUALS", value: "true", logical_group: "GROUP_MAIN", priority: 1, enabled: true },
  { id: "wrc-R026", workRuleId: "wr-R026", condition_type: "IS_ON_LEAVE", operator: "EQUALS", value: "true", logical_group: "GROUP_MAIN", priority: 1, enabled: true },
  { id: "wrc-wrc-R066", workRuleId: "wr-R066", condition_type: "IS_UNAVAILABLE", operator: "EQUALS", value: "true", logical_group: "GROUP_MAIN", priority: 1, enabled: true },
] as const;

// ============================================================================
// 10. MÓDULOS
// ============================================================================

const MODULES = [
  { id: "mod-dashboard", code: "DASHBOARD", name: "Panel de Control", description: "Vista unificada con indicadores clave de rendimiento (KPIs), alertas operacionales en tiempo real e índices de fatiga.", category: "ANALYTICS", version: "1.0.0", icon: "LayoutDashboard", route: "/dashboard", isCore: true, isSystem: false, isActive: true },
  { id: "mod-schedules", code: "SCHEDULES_MANAGEMENT", name: "Gestión de Cuadrantes", description: "Planificación integral de turnos, ejecución del Schedule Engine (IA), balanceo de personal y publicación oficial de horarios.", category: "PLANNING", version: "1.2.0", icon: "CalendarDays", route: "/schedules", isCore: true, isSystem: false, isActive: true },
  { id: "mod-staff", code: "STAFF_MANAGEMENT", name: "Personal Médico y Enfermería", description: "Administración central de perfiles de enfermeros, contratos, asignaciones de roles primarios y competencias clínicas.", category: "CORE_HR", version: "1.0.0", icon: "Users", route: "/staff", isCore: true, isSystem: false, isActive: true },
  { id: "mod-leaves", code: "LEAVES_MANAGEMENT", name: "Licencias y Vacaciones", description: "Flujo de solicitudes, incidencias, ausencias médicas y aprobaciones con impacto directo en las restricciones del calendario.", category: "CORE_HR", version: "1.1.0", icon: "FileClock", route: "/leaves", isCore: false, isSystem: false, isActive: true },
  { id: "mod-rules", code: "WORK_RULES", name: "Motor de Reglas de Trabajo", description: "Configuración de restricciones estrictas (Hard Rules), ponderaciones suaves (Soft Rules) y eventos reactivos del validador.", category: "PLANNING", version: "1.5.0", icon: "ShieldAlert", route: "/work-rules", isCore: true, isSystem: true, isActive: true },
  { id: "mod-organization", code: "ORGANIZATION_STRUCTURE", name: "Estructura Hospitalaria", description: "Mantenimiento jerárquico de sucursales (Branches), departamentos clínicos, especialidades y mapeo de sub-áreas.", category: "INFRASTRUCTURE", version: "1.0.0", icon: "Hospital", route: "/organization", isCore: true, isSystem: true, isActive: true },
  { id: "mod-analytics", code: "CLINICAL_ANALYTICS", name: "Métricas y Reportería", description: "Reportes avanzados de cobertura de emergencias, saturación de personal, horas extras acumuladas y exportación de nómina.", category: "ANALYTICS", version: "1.0.0", icon: "BarChartBig", route: "/analytics", isCore: false, isSystem: false, isActive: true },
  { id: "mod-integrations", code: "INTEGRATIONS_WEBHOOKS", name: "Integraciones y Webhooks", description: "Pasarela para sincronización con relojes biométricos externos, webhooks de salida y logs de eventos compartidos.", category: "INTEGRATIONS", version: "1.0.0", icon: "Webhook", route: "/integrations", isCore: false, isSystem: true, isActive: true },
  { id: "mod-settings", code: "SYSTEM_SETTINGS", name: "Configuración del Sistema", description: "Control de SystemConfiguration (horas máximas, descansos mínimos) y activación global de Feature Flags operacionales.", category: "INFRASTRUCTURE", version: "1.0.0", icon: "Settings", route: "/settings", isCore: true, isSystem: true, isActive: true },
  { id: "mod-audit", code: "AUDIT_LOGS", name: "Auditoría y Trazabilidad", description: "Historial inmutable de logs técnicos y operativos de infraestructura para cumplimiento técnico y revisión de cambios de turnos.", category: "INFRASTRUCTURE", version: "1.0.0", icon: "History", route: "/audit", isCore: true, isSystem: true, isActive: true },
] as const;

// ============================================================================
// 11. REGLAS DE DISTRIBUCIÓN MENSUAL Y GRUPOS DE REGLAS
// ============================================================================

const MONTHLY_DISTRIBUTION_RULES = [
  { id: "mdr-01", departmentId: "dept-01", type: "BALANCE_NIGHTS", configuration: { max_variance: 2 } },
  { id: "mdr-02", departmentId: "dept-01", type: "BALANCE_WEEKENDS", configuration: { max_weekends_per_month: 2 } },
  { id: "mdr-03", departmentId: "dept-02", type: "LIMIT_OVERTIME", configuration: { max_overtime_hours: 20 } },
  { id: "mdr-04", departmentId: "dept-02", type: "ROTATE_HOLIDAYS", configuration: { mandatory_rotation: true } },
  { id: "mdr-05", departmentId: "dept-03", type: "FAIRNESS_PRIORITY", configuration: { weight: 0.8 } },
  { id: "mdr-06", departmentId: "dept-04", type: "BALANCE_NIGHTS", configuration: { max_variance: 1 } },
  { id: "mdr-07", departmentId: "dept-05", type: "DISTRIBUTE_NEW_STAFF", configuration: { pair_with_senior: true } },
  { id: "mdr-08", departmentId: "dept-06", type: "ICU_ROTATION", configuration: { max_consecutive_months: 3 } },
  { id: "mdr-09", departmentId: "dept-07", type: "LIMIT_OVERTIME", configuration: { max_overtime_hours: 10 } },
  { id: "mdr-10", departmentId: "dept-08", type: "BALANCE_WEEKENDS", configuration: { max_weekends_per_month: 3 } },
] as const;

const RULE_GROUPS = [
  { id: "rg-01", code: "RG-LEGAL", name: "Reglas Legales Base", description: "Límites de ley laboral dominicana", isActive: true },
  { id: "rg-02", code: "RG-FATIGUE", name: "Fatiga y Descanso", description: "Reglas de protección al empleado", isActive: true },
  { id: "rg-03", code: "RG-ICU", name: "Cobertura UCI", description: "Reglas estrictas para intensivos", isActive: true },
  { id: "rg-04", code: "RG-WEEKEND", name: "Equidad Fines de Semana", description: "Balanceo de turnos difíciles", isActive: true },
  { id: "rg-05", code: "RG-MAT", name: "Reglas de Maternidad", description: "Protección a embarazadas", isActive: true },
  { id: "rg-06", code: "RG-OVERTIME", name: "Control de Horas Extras", description: "Presupuesto y salud", isActive: true },
  { id: "rg-07", code: "RG-JUNIOR", name: "Reglas de Novatos", description: "Supervisión requerida", isActive: true },
  { id: "rg-08", code: "RG-ER", name: "Cobertura Emergencias", description: "Alta disponibilidad ER", isActive: true },
  { id: "rg-09", code: "RG-SURG", name: "Restricciones Quirófano", description: "Certificaciones requeridas", isActive: true },
  { id: "rg-10", code: "RG-HOLIDAY", name: "Reglas de Fin de Año", description: "Distribución de feriados", isActive: true },
] as const;

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function main() {
  console.log("🌱 Iniciando la inserción de datos de prueba (seed idempotente)...");

  // ── 1. SystemConfiguration ──
  for (const cfg of SYSTEM_CONFIGURATIONS) {
    await prisma.systemConfiguration.upsert({
      where: { id: cfg.id },
      update: { value: cfg.value },
      create: { id: cfg.id, key: cfg.key, value: cfg.value },
    });
  }
  console.log(`✅ ${SYSTEM_CONFIGURATIONS.length} configuraciones del sistema.`);

  // ── 2. FeatureFlag ──
  for (const flag of FEATURE_FLAGS) {
    await prisma.featureFlag.upsert({
      where: { id: flag.id },
      update: { isActive: flag.isActive },
      create: { id: flag.id, feature_name: flag.feature_name, isActive: flag.isActive },
    });
  }
  console.log(`✅ ${FEATURE_FLAGS.length} feature flags.`);

  // ── 3. Organización ──
  const organization = await prisma.organization.upsert({
    where: { id: ORG_ID },
    update: {
      name: "Hospital General Central",
      code: "HOSP-GEN-01",
      timezone: "America/Santo_Domingo",
      country: "DO",
      status: "A",
    },
    create: {
      id: ORG_ID,
      name: "Hospital General Central",
      code: "HOSP-GEN-01",
      timezone: "America/Santo_Domingo",
      country: "DO",
      status: "A",
    },
  });
  console.log(`✅ Organización: ${organization.name}`);

  // ── 4. OrganizationSetting (1:1 con organización) ──
  await prisma.organizationSetting.upsert({
    where: { organizationId: ORG_ID },
    update: {
      birthday_free_day_enabled: true,
      require_shift_approval: true,
      auto_balance_nights: true,
      allow_overtime: true,
      max_monthly_hours: 160,
      max_weekly_hours: 44,
      overtime_limit: 20,
      max_nights: 10,
      max_consecutive_nights: 3,
      minimum_rest_hours: 12,
      max_consecutive_days: 6,
      auto_assign_emergency: false,
      auto_approve_swaps: false,
    },
    create: {
      organizationId: ORG_ID,
      birthday_free_day_enabled: true,
      require_shift_approval: true,
      auto_balance_nights: true,
      allow_overtime: true,
      max_monthly_hours: 160,
      max_weekly_hours: 44,
      overtime_limit: 20,
      max_nights: 10,
      max_consecutive_nights: 3,
      minimum_rest_hours: 12,
      max_consecutive_days: 6,
      auto_assign_emergency: false,
      auto_approve_swaps: false,
    },
  });
  console.log("✅ Configuración de organización.");

  // ── 5. Sucursales ──
  // Se resuelve por id y, si no existe, por (organizationId, name) para no
  // colisionar con sedes preexistentes creadas manualmente con el mismo nombre
  // (p. ej. "Dispensario Médico"). El id real se conserva y se mapea.
  const branchIdBySeedId = new Map<string, string>();

  for (const branch of BRANCHES) {
    const existingById = await prisma.branch.findUnique({
      where: { id: branch.id },
    });
    const existing =
      existingById ??
      (await prisma.branch.findFirst({
        where: { organizationId: ORG_ID, name: branch.name },
      }));

    const data = {
      name: branch.name,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      country: branch.country,
      zipCode: branch.zipCode,
      phone: branch.phone,
      email: branch.email,
      latitude: branch.latitude,
      longitude: branch.longitude,
      isMainBranch: branch.isMainBranch,
    };

    if (existing) {
      if (branch.isMainBranch) {
        await prisma.branch.updateMany({
          where: {
            organizationId: ORG_ID,
            isMainBranch: true,
            NOT: { id: existing.id },
          },
          data: { isMainBranch: false },
        });
      }

      const saved = await prisma.branch.update({
        where: { id: existing.id },
        data: { ...data, organizationId: ORG_ID },
      });
      branchIdBySeedId.set(branch.id, saved.id);
    } else {
      const saved = await prisma.branch.create({
        data: {
          id: branch.id,
          organizationId: ORG_ID,
          ...data,
        },
      });
      branchIdBySeedId.set(branch.id, saved.id);
    }
  }
  console.log(`✅ ${BRANCHES.length} sucursales.`);

  // ── 6. Departamentos ──
  // La sede ya no vive en Department: se modela con la tabla puente
  // DepartmentBranch (N:M), usando la sede histórica como sede primaria.
  const departmentMap = new Map<string, string>();
  const branchByDepartmentId = new Map<string, string>(
    DEPARTMENTS.map((dep) => [
      dep.id,
      branchIdBySeedId.get(dep.branchId) ?? dep.branchId,
    ]),
  );

  for (const dep of DEPARTMENTS) {
    const dpt = await prisma.department.upsert({
      where: {
        organizationId_code: {
          organizationId: ORG_ID,
          code: dep.code,
        },
      },
      update: {
        name: dep.name,
        organizationId: ORG_ID,
        code: dep.code,
        description: dep.description,
        type: dep.type,
        criticalLevel: dep.criticalLevel,
        minimumStaff: dep.minimumStaff,
        optimalStaff: dep.optimalStaff,
        maxCapacity: dep.maxCapacity,
        allowOvertime: dep.allowOvertime,
      },
      create: {
        id: dep.id,
        organizationId: ORG_ID,
        code: dep.code,
        name: dep.name,
        description: dep.description,
        type: dep.type,
        criticalLevel: dep.criticalLevel,
        minimumStaff: dep.minimumStaff,
        optimalStaff: dep.optimalStaff,
        maxCapacity: dep.maxCapacity,
        allowOvertime: dep.allowOvertime,
      },
    });
    departmentMap.set(dep.code, dpt.id);

    await prisma.departmentBranch.upsert({
      where: {
        departmentId_branchId: {
          departmentId: dpt.id,
          branchId: dep.branchId,
        },
      },
      update: {
        isPrimary: true,
      },
      create: {
        departmentId: dpt.id,
        branchId: dep.branchId,
        isPrimary: true,
      },
    });
  }
  console.log(`✅ ${DEPARTMENTS.length} departamentos.`);

  // ── 7. DepartmentConfiguration ──
  for (const dc of DEPARTMENT_CONFIGURATIONS) {
    const depId = departmentMap.get(dc.departmentId) ?? dc.departmentId;
    await prisma.departmentConfiguration.upsert({
      where: { id: dc.id },
      update: {
        organizationId: ORG_ID,
        departmentId: depId,
        max_nights: dc.max_nights,
        minimum_staff_per_shift: dc.minimum_staff_per_shift,
        allow_externeal_support: dc.allow_externeal_support,
        allow_double_shift: dc.allow_double_shift,
      },
      create: {
        id: dc.id,
        organizationId: ORG_ID,
        departmentId: depId,
        max_nights: dc.max_nights,
        minimum_staff_per_shift: dc.minimum_staff_per_shift,
        allow_externeal_support: dc.allow_externeal_support,
        allow_double_shift: dc.allow_double_shift,
      },
    });
  }
  console.log(`✅ ${DEPARTMENT_CONFIGURATIONS.length} configuraciones de departamento.`);

  // ── 8. Especialidades ──
  for (const spec of SPECIALITIES) {
    await prisma.speciality.upsert({
      where: { id: spec.id },
      update: {
        name: spec.name,
        organizationId: ORG_ID,
        code: spec.code,
        description: spec.description,
      },
      create: {
        id: spec.id,
        organizationId: ORG_ID,
        code: spec.code,
        name: spec.name,
        description: spec.description,
      },
    });
  }
  console.log(`✅ ${SPECIALITIES.length} especialidades.`);

  // ── 9. Departamento-Especialidad (composite) ──
  for (const ds of DEPARTMENT_SPECIALTIES) {
    await prisma.departmentSpeciality.upsert({
      where: { departmentId_specialityId: { departmentId: ds.departmentId, specialityId: ds.specialityId } },
      update: {
        required: ds.required,
        priority: ds.priority,
        minimum_staff: ds.minimum_staff,
      },
      create: {
        departmentId: ds.departmentId,
        specialityId: ds.specialityId,
        required: ds.required,
        priority: ds.priority,
        minimum_staff: ds.minimum_staff,
      },
    });
  }
  console.log(`✅ ${DEPARTMENT_SPECIALTIES.length} departamento-especialidad.`);

  // ── 10. Roles ──
  for (const role of ROLES) {
    await prisma.roles.upsert({
      where: { id: role.id },
      update: { name: role.name },
      create: { id: role.id, name: role.name },
    });
  }
  console.log(`✅ ${ROLES.length} roles.`);

  // ── 11. Usuarios (clave: email) ──
  for (const user of USERS) {
    const branchId = branchByDepartmentId.get(user.departmentId);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: ORG_ID,
        departmentId: user.departmentId,
        branchId,
        rolesId: user.rolesId,
        status: "ACTIVE",
      },
      create: {
        id: user.id,
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: ORG_ID,
        departmentId: user.departmentId,
        branchId,
        rolesId: user.rolesId,
        status: "ACTIVE",
        refreshToken: "",
      },
    });
  }
  console.log(`✅ ${USERS.length} usuarios.`);

  // ── 12. Enfermeras (clave: userId, único) ──
  const branchByNurseId = new Map<string, string | undefined>();
  for (const n of NURSES) {
    const branchId = branchByDepartmentId.get(n.departmentId);
    branchByNurseId.set(n.id, branchId);

    await prisma.nurse.upsert({
      where: { userId: n.userId },
      update: {
        departmentId: n.departmentId,
        branchId,
        contract_type: n.contract_type,
        hire_date: d(`${n.hire_date} 00:00:00`),
        status: n.status,
        specialityId: n.specialityId,
        organizationId: ORG_ID,
      },
      create: {
        id: n.id,
        userId: n.userId,
        departmentId: n.departmentId,
        branchId,
        contract_type: n.contract_type,
        hire_date: d(`${n.hire_date} 00:00:00`),
        status: n.status,
        specialityId: n.specialityId,
        organizationId: ORG_ID,
      },
    });
  }
  console.log(`✅ ${NURSES.length} enfermeras.`);

  // ── 13. Perfiles de enfermera (clave: nurseId, único) ──
  for (const p of NURSE_PROFILES) {
    await prisma.nurseProfile.upsert({
      where: { nurseId: p.nurseId },
      update: {
        organizationId: ORG_ID,
        birthDate: d(`${p.birthDate} 00:00:00`),
        emergencyContactName: p.emergencyContactName,
        emergencyContactPhone: p.emergencyContactPhone,
        educationLevel: p.educationLevel,
        yearsOfExperience: p.yearsOfExperience,
        notes: p.notes,
      },
      create: {
        id: p.id,
        nurseId: p.nurseId,
        organizationId: ORG_ID,
        birthDate: d(`${p.birthDate} 00:00:00`),
        emergencyContactName: p.emergencyContactName,
        emergencyContactPhone: p.emergencyContactPhone,
        educationLevel: p.educationLevel,
        yearsOfExperience: p.yearsOfExperience,
        notes: p.notes,
      },
    });
  }
  console.log(`✅ ${NURSE_PROFILES.length} perfiles de enfermera.`);

  // ── 14. Preferencias (clave: nurseId, único) ──
  for (const p of NURSE_PREFERENCES) {
    await prisma.nursePreferences.upsert({
      where: { nurseId: p.nurseId },
      update: {
        organizationId: ORG_ID,
        preferredShift: p.preferredShift,
        avoid_shifts: p.avoid_shifts,
        maxNigthsPerMonth: p.maxNigthsPerMonth,
        maxDaysPerMonth: p.maxDaysPerMonth,
        preferredDaysOff: p.preferredDaysOff,
        prefersWeekendsOff: p.prefersWeekendsOff,
        allowOvertime: p.allowOvertime,
      },
      create: {
        id: p.id,
        nurseId: p.nurseId,
        organizationId: ORG_ID,
        preferredShift: p.preferredShift,
        avoid_shifts: p.avoid_shifts,
        maxNigthsPerMonth: p.maxNigthsPerMonth,
        maxDaysPerMonth: p.maxDaysPerMonth,
        preferredDaysOff: p.preferredDaysOff,
        prefersWeekendsOff: p.prefersWeekendsOff,
        allowOvertime: p.allowOvertime,
      },
    });
  }
  console.log(`✅ ${NURSE_PREFERENCES.length} preferencias de enfermera.`);

  // ── 15. Tipos de restricción (clave: code, único) ──
  for (const t of NURSE_RESTRICTION_TYPES) {
    await prisma.nurseRestrictionType.upsert({
      where: { code: t.code },
      update: {
        name: t.name,
        description: t.description,
        severity: t.severity,
        affects_scheduler: t.affects_scheduler,
        affects_overtime: t.affects_overtime,
        affects_nights: t.affects_nights,
        isSystem: t.isSystem,
        isActive: t.isActive,
      },
      create: {
        id: t.id,
        code: t.code,
        name: t.name,
        description: t.description,
        severity: t.severity,
        affects_scheduler: t.affects_scheduler,
        affects_overtime: t.affects_overtime,
        affects_nights: t.affects_nights,
        isSystem: t.isSystem,
        isActive: t.isActive,
      },
    });
  }
  console.log(`✅ ${NURSE_RESTRICTION_TYPES.length} tipos de restricción.`);

  // ── 16. Restricciones (clave compuesta nurseId + restrictionTypeId) ──
  for (const r of NURSE_RESTRICTIONS) {
    await prisma.nurseRestriction.upsert({
      where: { nurseId_restrictionTypeId: { nurseId: r.nurseId, restrictionTypeId: r.restrictionTypeId } },
      update: {
        organizationId: ORG_ID,
        isTemporary: r.isTemporary,
        isActive: r.isActive,
      },
      create: {
        id: r.id,
        organizationId: ORG_ID,
        nurseId: r.nurseId,
        restrictionTypeId: r.restrictionTypeId,
        isTemporary: r.isTemporary,
        isActive: r.isActive,
      },
    });
  }
  console.log(`✅ ${NURSE_RESTRICTIONS.length} restricciones de enfermera.`);

  // ── 17. Turnos (clave: code, único) ──
  for (const s of SHIFTS) {
    const branchId = branchByDepartmentId.get(s.departmentId);
    await prisma.shift.upsert({
      where: {
        organizationId_code: {
          organizationId: ORG_ID,
          code: s.code,
        },
      },
      update: {
        organizationId: ORG_ID,
        name: s.name,
        type: s.type,
        startTime: s.startTime,
        endTime: s.endTime,
        durationHours: s.durationHours,
        departmentId: s.departmentId,
        branchId,
      },
      create: {
        id: s.id,
        organizationId: ORG_ID,
        name: s.name,
        code: s.code,
        type: s.type,
        startTime: s.startTime,
        endTime: s.endTime,
        durationHours: s.durationHours,
        departmentId: s.departmentId,
        branchId,
      },
    });
  }
  console.log(`✅ ${SHIFTS.length} turnos.`);

  // ── 18. Plantillas de turno (clave: id) ──
  for (const t of SHIFT_TEMPLATES) {
    const branchId = branchByDepartmentId.get(t.departmentId)!;
    await prisma.shiftTemplate.upsert({
      where: { id: t.id },
      update: {
        organizationId: ORG_ID,
        departmentId: t.departmentId,
        branchId,
        name: t.name,
        description: t.description,
        configuration: {},
        minimum_staff: t.minimum_staff,
        durationHours: t.durationHours,
        isNightShift: t.isNightShift,
        startTime: t.startTime,
        endTime: t.endTime,
        color: t.color,
        isActive: t.isActive,
        autoAssignable: t.autoAssignable,
        priority: t.priority,
      },
      create: {
        id: t.id,
        organizationId: ORG_ID,
        departmentId: t.departmentId,
        branchId,
        name: t.name,
        description: t.description,
        configuration: {},
        minimum_staff: t.minimum_staff,
        durationHours: t.durationHours,
        isNightShift: t.isNightShift,
        startTime: t.startTime,
        endTime: t.endTime,
        color: t.color,
        isActive: t.isActive,
        autoAssignable: t.autoAssignable,
        priority: t.priority,
      },
    });
  }
  console.log(`✅ ${SHIFT_TEMPLATES.length} plantillas de turno.`);

  // ── 19. Eventos de tiempo ──
  for (const a of ABSENCES) {
    const branchId = branchByNurseId.get(a.nurseId);
    await prisma.absence.upsert({
      where: { id: a.id },
      update: {
        organizationId: ORG_ID,
        branchId,
        type: a.type,
        reason: a.reason,
        reporterById: a.reporterById,
        date: a.date,
      },
      create: {
        id: a.id,
        nurseId: a.nurseId,
        organizationId: ORG_ID,
        branchId,
        type: a.type,
        reason: a.reason,
        reporterById: a.reporterById,
        date: a.date,
      },
    });
  }
  console.log(`✅ ${ABSENCES.length} ausencias.`);

  for (const av of NURSE_AVAILABILITY) {
    const branchId = branchByNurseId.get(av.nurseId);
    await prisma.nurseAvailability.upsert({
      where: { id: av.id },
      update: {
        organizationId: ORG_ID,
        branchId,
        date: av.date,
        status: av.status,
      },
      create: {
        id: av.id,
        organizationId: ORG_ID,
        nurseId: av.nurseId,
        branchId,
        date: av.date,
        status: av.status,
      },
    });
  }
  console.log(`✅ ${NURSE_AVAILABILITY.length} disponibilidades.`);

  for (const v of VACATIONS) {
    const branchId =
      branchByNurseId.get(v.nurseId) ??
      branchByDepartmentId.get(v.departmentId);
    await prisma.vacation.upsert({
      where: { id: v.id },
      update: {
        organizationId: ORG_ID,
        departmentId: v.departmentId,
        nurseId: v.nurseId,
        branchId,
        startDate: v.startDate,
        endDate: v.endDate,
        status: v.status,
        reason: v.reason,
        notes: v.notes,
      },
      create: {
        id: v.id,
        organizationId: ORG_ID,
        departmentId: v.departmentId,
        nurseId: v.nurseId,
        branchId,
        startDate: v.startDate,
        endDate: v.endDate,
        status: v.status,
        reason: v.reason,
        notes: v.notes,
      },
    });
  }
  console.log(`✅ ${VACATIONS.length} vacaciones.`);

  for (const l of LEAVES) {
    const branchId = branchByDepartmentId.get(l.departmentId);
    await prisma.leave.upsert({
      where: { id: l.id },
      update: {
        organiztionId: ORG_ID,
        departmentId: l.departmentId,
        userId: l.userId,
        branchId,
        type: l.type,
        startDate: l.startDate,
        endDate: l.endDate,
        reason: l.reason,
        status: l.status,
      },
      create: {
        id: l.id,
        organiztionId: ORG_ID,
        departmentId: l.departmentId,
        userId: l.userId,
        branchId,
        type: l.type,
        startDate: l.startDate,
        endDate: l.endDate,
        reason: l.reason,
        status: l.status,
      },
    });
  }
  console.log(`✅ ${LEAVES.length} licencias.`);

  // ── 19.5. WorkLoadMetrics (clave: id) ──
  for (const wlm of WORKLOAD_METRICS) {
    await prisma.workLoadMetrics.upsert({
      where: { id: wlm.id },
      update: {
        organizationId: ORG_ID,
        nurseId: wlm.nurseId,
        month: wlm.month,
        year: wlm.year,
        total_hours: wlm.total_hours,
        overtime_hours: wlm.overtime_hours,
        regular_hours: wlm.regular_hours,
        nigth_hours: wlm.nigth_hours,
        weekend_hours: wlm.weekend_hours,
        holidy_hours: wlm.holidy_hours,
        emergency_hours: wlm.emergency_hours,
        fatigue_score: wlm.fatigue_score,
        fairness_score: wlm.fairness_score,
        workload_score: wlm.workload_score,
        burnout_risk: wlm.burnout_risk,
      },
      create: {
        id: wlm.id,
        organizationId: ORG_ID,
        nurseId: wlm.nurseId,
        month: wlm.month,
        year: wlm.year,
        total_hours: wlm.total_hours,
        overtime_hours: wlm.overtime_hours,
        regular_hours: wlm.regular_hours,
        nigth_hours: wlm.nigth_hours,
        weekend_hours: wlm.weekend_hours,
        holidy_hours: wlm.holidy_hours,
        emergency_hours: wlm.emergency_hours,
        fatigue_score: wlm.fatigue_score,
        fairness_score: wlm.fairness_score,
        workload_score: wlm.workload_score,
        burnout_risk: wlm.burnout_risk,
      },
    });
  }
  console.log(`✅ ${WORKLOAD_METRICS.length} métricas de carga de trabajo.`);

  // ── 20. Permisos ──
  // 20.a. Permisos de DummyData.sql PRIMERO — se preservan los IDs fijos perm-XX
  //       (necesarios para que role_permissions y el resto de la app resuelvan
  //       correctamente cada permiso).
  const dummyPermissionNames: string[] = [];
  for (const p of DUMMY_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { id: p.id },
      update: { name: p.name, description: p.description },
      create: { id: p.id, name: p.name, description: p.description },
    });
    dummyPermissionNames.push(p.name);
  }

  // 20.b. Permisos de la app (PERMISSIONS constants) — descripción autogenerada.
  //       Los que coinciden con DummyData se actualizan (mantienen su id perm-XX);
  //       los que son exclusivos de la app se crean con id autogenerado.
  const permissionCodes: string[] = [];
  for (const category of Object.values(PERMISSIONS)) {
    for (const code of Object.values(category)) {
      permissionCodes.push(code);
    }
  }

  let appOnlyCount = 0;
  for (const code of permissionCodes) {
    const description = `Permite realizar la acción de ${code.toLowerCase().replace(/_/g, " ")}`;
    const existed = dummyPermissionNames.includes(code);
    await prisma.permission.upsert({
      where: { name: code },
      update: { description },
      create: { name: code, description },
    });
    if (!existed) appOnlyCount++;
  }

  const allPermissions = await prisma.permission.findMany({ select: { id: true, name: true } });
  const permIdByName = new Map(allPermissions.map((p) => [p.name, p.id]));
  console.log(
    `✅ ${DUMMY_PERMISSIONS.length} permisos (DummyData) + ${appOnlyCount} exclusivos de la app = ${allPermissions.length} totales.`,
  );

  // ── 21. RolePermissions (composite roleId + permisionId) ──
  const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
    "role-01": [
      "CREATE_SCHEDULE",
      "EDIT_SCHEDULE",
      "APPROVE_VACATION",
      "VIEW_REPORTS",
      "MANAGE_USERS",
    ],
    "role-02": ["APPROVE_SWAPS", "VIEW_REPORTS"],
    "role-06": ["CREATE_SCHEDULE", "EDIT_SCHEDULE", "APPROVE_SWAPS"],
  };

  let rolePermCount = 0;
  for (const [roleId, codes] of Object.entries(ROLE_PERMISSIONS_MAP)) {
    for (const code of codes) {
      const permisionId = permIdByName.get(code);
      if (!permisionId) {
        throw new Error(`Permiso "${code}" no encontrado para el rol "${roleId}".`);
      }
      await prisma.rolePermissions.upsert({
        where: { roleId_permisionId: { roleId, permisionId } },
        update: {},
        create: { roleId, permisionId },
      });
      rolePermCount++;
    }
  }
  console.log(`✅ ${rolePermCount} asignaciones rol-permiso.`);

  // ── 22. Reglas de distribución mensual ──
  for (const mdr of MONTHLY_DISTRIBUTION_RULES) {
    const depId = departmentMap.get(mdr.departmentId) ?? mdr.departmentId;
    await prisma.monthlyDistributionRule.upsert({
      where: { id: mdr.id },
      update: {
        organizationId: ORG_ID,
        departmentId: depId,
        type: mdr.type,
        configuration: mdr.configuration,
      },
      create: {
        id: mdr.id,
        organizationId: ORG_ID,
        departmentId: depId,
        type: mdr.type,
        configuration: mdr.configuration,
      },
    });
  }
  console.log(`✅ ${MONTHLY_DISTRIBUTION_RULES.length} reglas de distribución mensual.`);

  // ── 23. Grupos de reglas ──
  for (const rg of RULE_GROUPS) {
    await prisma.ruleGroup.upsert({
      where: { id: rg.id },
      update: {
        organizationId: ORG_ID,
        name: rg.name,
        code: rg.code,
        description: rg.description,
        isActive: rg.isActive,
      },
      create: {
        id: rg.id,
        organizationId: ORG_ID,
        name: rg.name,
        code: rg.code,
        description: rg.description,
        isActive: rg.isActive,
      },
    });
  }
  console.log(`✅ ${RULE_GROUPS.length} grupos de reglas.`);

  // ── 24. WorkRules ──
  for (const rule of WORK_RULES) {
    await prisma.workRule.upsert({
      where: { id: rule.id },
      update: {
        organizationId: ORG_ID,
        code: rule.code,
        name: rule.name,
        type: rule.type,
        description: rule.description,
        value: rule.value,
        isActive: true,
      },
      create: {
        id: rule.id,
        organizationId: ORG_ID,
        code: rule.code,
        name: rule.name,
        type: rule.type,
        description: rule.description,
        value: rule.value,
        isActive: true,
      },
    });
  }
  console.log(`✅ ${WORK_RULES.length} reglas de trabajo.`);

  // ── 25. WorkRuleConditions ──
  for (const cond of WORK_RULE_CONDITIONS_EXPLICIT) {
    await prisma.workRuleConditions.upsert({
      where: { id: cond.id },
      update: {
        workRuleId: cond.workRuleId,
        condition_type: cond.condition_type,
        operator: cond.operator,
        value: cond.value,
        logical_group: cond.logical_group,
        priority: cond.priority,
        enabled: cond.enabled,
      },
      create: {
        id: cond.id,
        workRuleId: cond.workRuleId,
        condition_type: cond.condition_type,
        operator: cond.operator,
        value: cond.value,
        logical_group: cond.logical_group,
        priority: cond.priority,
        enabled: cond.enabled,
      },
    });
  }

  // Reglas administrativas/futuras (desactivadas por defecto para el motor)
  const explicitCodes = new Set(WORK_RULE_CONDITIONS_EXPLICIT.map((c) => c.workRuleId.slice(2)));
  let adminConditionCount = 0;
  for (const rule of WORK_RULES) {
    const shortCode = rule.code.slice(2);
    if (explicitCodes.has(shortCode)) continue;
    const id = `wrc-${shortCode}`;
    await prisma.workRuleConditions.upsert({
      where: { id },
      update: {
        workRuleId: rule.id,
        condition_type: "ADMIN_INTERACTION_REQUIRED",
        operator: "EQUALS",
        value: "true",
        logical_group: "GROUP_MAIN",
        priority: 1,
        enabled: false,
      },
      create: {
        id,
        workRuleId: rule.id,
        condition_type: "ADMIN_INTERACTION_REQUIRED",
        operator: "EQUALS",
        value: "true",
        logical_group: "GROUP_MAIN",
        priority: 1,
        enabled: false,
      },
    });
    adminConditionCount++;
  }
  console.log(`✅ ${WORK_RULE_CONDITIONS_EXPLICIT.length + adminConditionCount} condiciones de reglas.`);

  // ── 26. WorkRuleActions (derivadas del tipo de regla) ──
  for (const rule of WORK_RULES) {
    const id = `wra-${rule.code.slice(2)}`;
    const isHard = rule.type === "HARD";
    const isEvent = rule.type === "EVENT";
    const action_type = isHard ? "REJECT_NURSE" : rule.type === "SOFT" ? "ADJUST_SCORE" : isEvent ? "TRIGGER_EVENT" : "APPLY_SETTING";
    const action_value = isHard ? "Violación de restricción estricta" : rule.type === "SOFT" ? "-15" : isEvent ? "DISPATCH_ALERT" : "SET_VAR";
    await prisma.workRuleActions.upsert({
      where: { id },
      update: {
        workRuleId: rule.id,
        action_type,
        action_value,
        priority: 1,
        enabled: true,
        stop_execution: isHard,
        async_execution: isEvent,
        metadata: { ruleCode: rule.code },
      },
      create: {
        id,
        workRuleId: rule.id,
        action_type,
        action_value,
        priority: 1,
        enabled: true,
        stop_execution: isHard,
        async_execution: isEvent,
        metadata: { ruleCode: rule.code },
      },
    });
  }
  console.log(`✅ ${WORK_RULES.length} acciones de reglas.`);

  // ── 27. Módulos (clave: code, único) ──
  for (const m of MODULES) {
    await prisma.module.upsert({
      where: { code: m.code },
      update: {
        name: m.name,
        description: m.description,
        category: m.category,
        version: m.version,
        icon: m.icon,
        route: m.route,
        isCore: m.isCore,
        isSystem: m.isSystem,
        isActive: m.isActive,
      },
      create: {
        id: m.id,
        code: m.code,
        name: m.name,
        description: m.description,
        category: m.category,
        version: m.version,
        icon: m.icon,
        route: m.route,
        isCore: m.isCore,
        isSystem: m.isSystem,
        isActive: m.isActive,
      },
    });
  }
  console.log(`✅ ${MODULES.length} módulos.`);

  console.log("🎉 ¡Seed completado con éxito!");
}

main()
  .catch((e) => {
    console.error("❌ Error ejecutando el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
