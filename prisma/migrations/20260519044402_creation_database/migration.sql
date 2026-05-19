-- CreateEnum
CREATE TYPE "SystemConfigurationKeys" AS ENUM ('MAX_MONTHLY_HOURS', 'MIN_REST_HOURS', 'ALLOW_DOUBLE_SHIFT', 'DEFAULT_SHIFT_DURATION', 'ENABLE_BIRTHDAY_DAY_OFF', 'AUTO_APPROVE_SHIFT_CHANGES', 'MAX_CONSECUTIVE_NIGHTS');

-- CreateEnum
CREATE TYPE "FeaturTypes" AS ENUM ('AUTO_SCHEDULING', 'SHIFT_SWAP_AUTOMATION', 'AI_FATIGUE_ANALYSIS', 'WHATSAPP_NOTIFICATIONS', 'EMERGENCY__AI', 'DARK_MODE', 'MULTI_BRANCH_SUPPORT');

-- CreateEnum
CREATE TYPE "OperationalAlertStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'IGNORED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "OperationalAlertyTypes" AS ENUM ('STAFF_SHORTAGE', 'OVERTIME_RISK', 'FATIGUE_RISK', 'RULE_VIOLATION', 'NO_NIGHT_COVERAGE', 'MULTIPLE_ABSENCES', 'OVERLOADED_NURSE', 'UNBALANCED_DISTRIBUTION', 'EMERGENCY_COVERAGE_REQUIRED');

-- CreateEnum
CREATE TYPE "ScheduleEntryStatus" AS ENUM ('ASSIGNED', 'CONFIRMED', 'PENDING', 'CANCELLED', 'REPLACED');

-- CreateEnum
CREATE TYPE "AbsenceType" AS ENUM ('SICKNESS', 'EMERGENCY', 'NO_SHOW', 'VACATION', 'MEDICAL_LICENSE', 'PERSONAL', 'UNJUSTIFIED');

-- CreateEnum
CREATE TYPE "AbsenceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COVERED');

-- CreateEnum
CREATE TYPE "NurseAvailabilityStatusType" AS ENUM ('AVAILABLE', 'PARTIAL', 'NOT_AVAILABLE');

-- CreateEnum
CREATE TYPE "ShiftPreferenceType" AS ENUM ('MORNING', 'AFTERNOON', 'NIGHT', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "VacationStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'SUSPENSION');

-- CreateEnum
CREATE TYPE "NurseRestrictionTypes" AS ENUM ('NO_NIGHT_SHIFTS', 'ONLY_NIGHT_SHIFTS', 'ONLY_DAY_SHIFTS', 'ONLY_MORNING_SHIFTS', 'ONLY_AFTERNOON_SHIFTS', 'NO_WEEKENDS', 'WEEKENDS_ONLY', 'NO_HOLIDAYS', 'NO_DOUBLE_SHIFTS', 'NO_CONSECUTIVE_SHIFTS', 'NO_CONSECUTIVE_NIGHTS', 'LIMITED_CONSECUTIVE_DAYS', 'LIMITED_HOURS', 'NO_OVERTIME', 'MAX_40_HOURS_WEEK', 'MAX_8_HOURS_DAY', 'REDUCED_WORKLOAD', 'PART_TIME_ONLY', 'PREGNANCY_RESTRICTION', 'MEDICAL_RESTRICTION', 'NO_HEAVY_PATIENTS', 'NO_STANDING_LONG_HOURS', 'FATIGUE_RECOVERY', 'POST_SURGERY_LIMITATION', 'TEMPORARY_HEALTH_LIMITATION', 'CHRONIC_CONDITION', 'MENTAL_HEALTH_RESTRICTION', 'ONLY_ICU', 'ONLY_ER', 'ONLY_PEDIATRICS', 'NO_ICU', 'NO_ER', 'NO_SURGERY', 'RESTRICTED_DEPARTMENT_ACCESS', 'UNDER_TRAINING', 'SUPERVISION_REQUIRED', 'NO_CRITICAL_PATIENTS', 'JUNIOR_LIMITATION', 'INTERN_RESTRICTION', 'PROBATION_PERIOD', 'UNION_RESTRICTION', 'CONTRACT_LIMITATION', 'TEMPORARY_EMPLOYEE', 'AGENCY_STAFF_ONLY', 'NO_EXTRA_SHIFTS', 'FIXED_SCHEDULE_ONLY', 'NO_EMERGENCY_COVERAGE', 'LAST_MINUTE_UNAVAILABLE', 'CANNOT_BE_ON_CALL', 'RESTRICTED_MOBILITY', 'NO_FLOATING', 'HIGH_FATIGUE_RISK', 'LABOR_LAW_LIMITATION', 'MINIMUM_REST_REQUIRED', 'MAX_MONTHLY_HOURS_REACHED', 'LICENSE_RESTRICTION', 'CERTIFICATION_EXPIRED', 'TEMPORARY_AVAILABILITY', 'VACATION_TRANSITION', 'RETURNING_FROM_LEAVE', 'RECENT_OVERTIME_BLOCK', 'HIGH_RISK_PATIENT_RESTRICTION', 'INFECTIOUS_AREA_RESTRICTION', 'ISOLATION_AREA_RESTRICTION', 'BIOHAZARD_LIMITATION');

-- CreateEnum
CREATE TYPE "NurseRestrictionDescriptions" AS ENUM ('NO_PUEDE_HACER_AMANECIDAS', 'SOLO_TRABAJA_NOCHES', 'SOLO_TRABAJA_DIAS', 'SOLO_MAÑANAS', 'SOLO_TARDES', 'NO_TRABAJA_FINES_DE_SEMANA', 'SOLO_FINES_DE_SEMANA', 'NO_TRABAJA_FERIADOS', 'NO_PUEDE_HACER_DOBLE_TURNO', 'NO_TURNOS_SEGUIDOS', 'NO_NOCHES_CONSECUTIVAS', 'MAXIMO_DIAS_SEGUIDOS', 'HORAS_LIMITADAS', 'NO_OVERTIME', 'MAXIMO_40H', 'MAXIMO_8H_POR_DIA', 'CARGA_REDUCIDA', 'SOLO_MEDIO_TIEMPO', 'RESTRICCION_EMBARAZO', 'RESTRICCION_MEDICA_GENERAL', 'NO_PACIENTES_PESADOS', 'NO_LARGAS_HORAS_DE_PIE', 'RECUPERACION_FISICA', 'RECUPERACION_CIRUGIA', 'RESTRICCION_TEMPORAL', 'CONDICION_CRONICA', 'SALUD_MENTAL', 'SOLO_UCI', 'SOLO_EMERGENCIAS', 'SOLO_PEDIATRIA', 'NO_UCI', 'NO_EMERGENCIAS', 'NO_CIRUGIA', 'ACCESO_LIMITADO', 'EN_ENTRENAMIENTO', 'REQUIERE_SUPERVISION', 'NO_CRITICOS', 'RESTRICCION_JUNIOR', 'PASANTIA', 'PERIODO_PRUEBA', 'SINDICATO', 'RESTRICCION_CONTRACTUAL', 'TEMPORAL', 'PERSONAL_EXTERNO', 'NO_TURNOS_EXTRA', 'HORARIO_FIJO', 'NO_COBERTURA_URGENTE', 'NO_DISPONIBILIDAD_URGENTE', 'NO_GUARDIAS', 'NO_MOVERSE_ENTRE_DEPARTAMENTOS', 'NO_SOPORTE_CRUZADO', 'ALTO_RIESGO_FATIGA', 'RESTRICCION_LEGAL', 'DESCANSO_OBLIGATORIO', 'LIMITE_MENSUAL_ALCANZADO', 'LICENCIA_LIMITADA', 'CERTIFICACION_VENCIDA', 'DISPONIBILIDAD_TEMPORAL', 'CERCA_VACACIONES', 'REINTEGRACION', 'BLOQUEADA_POR_OVERTIME_RECIENTE', 'NO_PACIENTES_ALTO_RISGO', 'NO_AREAS_INFECCIOSAS', 'NO_AISLAMIENTO', 'RESTRICCION_BIOSEGURIDAD');

-- CreateEnum
CREATE TYPE "EducationLevelTypes" AS ENUM ('ASSISTANT', 'TECHNICIAN', 'BACHELOR_DEGREE', 'SPECIALIZATION', 'MASTER_DEGREE', 'DOCTORATE');

-- CreateEnum
CREATE TYPE "NurseStatusType" AS ENUM ('ACTIVE', 'INACTIVE', 'VACATION', 'LICENSE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ContracTypeList" AS ENUM ('PERMANENT', 'TEMPORAL', 'PER_DIEM', 'PART_TIME');

-- CreateEnum
CREATE TYPE "ProviderList" AS ENUM ('TWILIO', 'WHATSAPP', 'GOOGLE_CALENDAR', 'OUTLOOK', 'SAP', 'ORACLE_HR', 'BIOMETRIC_SYSTEM', 'SMTP', 'FIREBASE');

-- CreateEnum
CREATE TYPE "NotificationCategoryTypes" AS ENUM ('SCHEDULE_PUBLISHED', 'SCHEDULE_UPDATED', 'SCHEDULE_ASSIGNMENT', 'SCHEDULE_REMOVED', 'SCHEDULE_CONFLICT', 'SCHEDULE_REMINDER', 'SHIFT_CHANGE_REQUESTED', 'SHIFT_CHANGE_APPROVED', 'SHIFT_CHANGE_REJECTED', 'SHIFT_CHANGE_CANCELLED', 'SHIFT_CHANGE_EXPIRED', 'SHIFT_CHANGE_REQUIRES_CONFIRMATION', 'VACATION_REQUESTED', 'VACATION_APPROVED', 'VACATION_REJECTED', 'VACATION_REMINDER', 'VACATION_CONFLICT', 'LEAVE_REQUESTED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'MEDICAL_DOCUMENT_REQUIRED', 'EMERGENCY_SHIFT_NEEDED', 'EMERGENCY_SHIFT_ASSIGNED', 'COVERAGE_SHORTAGE', 'COVERAGE_REQUEST', 'BACKUP_STAFF_REQUIRED', 'RULE_VIOLATION', 'OVERTIME_WARNING', 'NIGHT_SHIFT_LIMIT_REACHED', 'REST_PERIOD_VIOLATION', 'MONTHLY_HOUR_LIMIT_REACHED', 'APPROVAL_REQUIRED', 'APPROVAL_PENDING', 'APPROVAL_COMPLETED', 'APPROVAL_OVERDUE', 'DOCUMENT_EXPIRING', 'CREDENTIAL_EXPIRING', 'CONTRACT_UPDATE', 'POLICY_UPDATE', 'SYSTEM_MAINTENANCE', 'SECURITY_ALERT', 'PASSWORD_CHANGED', 'LOGIN_DETECTED', 'SCHEDULE_OPTIMIZED', 'FAIRNESS_ALERT', 'FATIGUE_RISK_DETECTED', 'STAFFING_PREDICTION_ALERT');

-- CreateEnum
CREATE TYPE "PriorityTypes" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL', 'INFO');

-- CreateEnum
CREATE TYPE "ActionAuditLogTypes" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'PUBLISH', 'ASSIGN_SHIFT', 'CANCEL_SHIFT', 'AUTO_GENERATE');

-- CreateEnum
CREATE TYPE "PreferredShift" AS ENUM ('MORNING', 'AFTERNOON', 'NIGHT', 'MORNING_AFTERNOON', 'MORNING_NIGHT', 'NIGTH_AFTERNOON');

-- CreateEnum
CREATE TYPE "ChangeApprovalsTypes" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('AWAITING_OTHER_NURSE', 'REJECTED_BY_NURSE', 'ACCEPTED_BY_NURSE', 'UNDER_SUPVERSION', 'APPROVED_BY_SUPERVISOR', 'REJECTED_BY_SUPERVISOR', 'CANCELLED', 'EXPIRED', 'COMPLETED', 'ROLLED_BACK', 'CONFLIC_DETECTED');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('MEDICAL', 'SICK_LEAVE', 'INJURY', 'SURGERY_RECOVERY', 'MATERNITY', 'PATERNITY', 'FAMILY_EMERGENCY', 'BEREAVMENT', 'ADMNISTRATIVE', 'SUSPENSION', 'TRAINING', 'CONFERENCE', 'PERSONAL', 'STUDY', 'RELIGIOUS', 'UNPAID');

-- CreateEnum
CREATE TYPE "ActivityLogType" AS ENUM ('LOGIN', 'LOGOUT', 'VIEW_SCHEDULE', 'EXPORT_REPORT', 'CREATE_SHIFT', 'SEARCH_USER', 'OPEN_NOTIFICATION');

-- CreateTable
CREATE TABLE "SystemConfiguration" (
    "id" TEXT NOT NULL,
    "key" "SystemConfigurationKeys" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SystemConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "feature_name" "FeaturTypes" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'A',

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_settings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "birthday_free_day_enabled" BOOLEAN NOT NULL,
    "max_monthly_hours" INTEGER NOT NULL DEFAULT 160,
    "require_shift_approval" BOOLEAN NOT NULL DEFAULT false,
    "auto_balance_nigths" BOOLEAN NOT NULL,
    "allow_cross_departament" BOOLEAN NOT NULL,
    "allor_overtime" BOOLEAN NOT NULL,
    "max_weekly_hours" INTEGER NOT NULL DEFAULT 44,
    "overtime_limit" INTEGER NOT NULL DEFAULT 20,
    "max_nights" INTEGER NOT NULL DEFAULT 10,
    "max_consecutive_nights" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "organization_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "minimum_staff" INTEGER NOT NULL,
    "critical_level" TEXT NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_specialties" (
    "departmentId" TEXT NOT NULL,
    "specialityId" TEXT NOT NULL,

    CONSTRAINT "department_specialties_pkey" PRIMARY KEY ("departmentId","specialityId")
);

-- CreateTable
CREATE TABLE "department_configurations" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "max_nigths" INTEGER NOT NULL,
    "minimum_staff_per_shift" INTEGER NOT NULL,
    "allow_externeal_support" BOOLEAN NOT NULL,
    "allow_double_shift" BOOLEAN NOT NULL,

    CONSTRAINT "department_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_alerts" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "alertType" "OperationalAlertyTypes" NOT NULL,
    "severity" "PriorityTypes" NOT NULL,
    "status" "OperationalAlertStatus" NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "operational_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "optimization_runs" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "startedAtd" TIMESTAMP(3) NOT NULL,
    "fineshedAt" TIMESTAMP(3) NOT NULL,
    "result" JSONB NOT NULL,

    CONSTRAINT "optimization_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_versions" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_entries" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "status" "ScheduleEntryStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assignedById" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "isEmergencyCoverage" BOOLEAN NOT NULL DEFAULT false,
    "optimizationScore" DECIMAL(65,30),
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,

    CONSTRAINT "schedule_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "contract_type" "ContracTypeList" NOT NULL DEFAULT 'PERMANENT',
    "hire_date" TIMESTAMP(3) NOT NULL,
    "status" "NurseStatusType" NOT NULL DEFAULT 'ACTIVE',
    "specialityId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "nurses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absences" (
    "id" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "AbsenceType" NOT NULL,
    "status" "AbsenceStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "reporterById" TEXT NOT NULL,
    "approvedById" TEXT,
    "notes" TEXT,
    "requiresCoverage" BOOLEAN NOT NULL DEFAULT true,
    "emergencyLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurse_availability" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "NurseAvailabilityStatusType" NOT NULL,
    "shiftPreference" "ShiftPreferenceType",
    "availableForEmergency" BOOLEAN NOT NULL DEFAULT false,
    "availableForOvertime" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nurse_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workload_metrics" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "total_hours" DECIMAL(65,30) NOT NULL,
    "overtime_hours" DECIMAL(65,30) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "regular_hours" DECIMAL(65,30) NOT NULL,
    "nigth_hours" DECIMAL(65,30) NOT NULL,
    "weekend_hours" DECIMAL(65,30) NOT NULL,
    "holidy_hours" DECIMAL(65,30) NOT NULL,
    "emergency_hours" DECIMAL(65,30) NOT NULL,
    "fatigue_score" DECIMAL(65,30) NOT NULL,
    "fairness_score" DECIMAL(65,30) NOT NULL,
    "workload_score" DECIMAL(65,30) NOT NULL,
    "burnout_risk" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workload_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "start_Date" TIMESTAMP(3) NOT NULL,
    "end_Date" TIMESTAMP(3) NOT NULL,
    "status" "VacationStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurse_profiles" (
    "id" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "emergencyContact" TEXT NOT NULL,
    "emergencyContactPhone" TEXT NOT NULL,
    "educationLevel" "EducationLevelTypes" NOT NULL,
    "yearsOfExperience" INTEGER,
    "certifications" JSONB,
    "languages" JSONB,
    "notes" TEXT,
    "health_restrictions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nurse_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NurseRestriction" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "restrictionTypeId" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "isTemporary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NurseRestriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurse_restrictions_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" "NurseRestrictionTypes" NOT NULL,
    "description" "NurseRestrictionDescriptions" NOT NULL,
    "severity" "PriorityTypes" NOT NULL,
    "affects_scheduler" BOOLEAN NOT NULL,
    "affects_overtime" BOOLEAN NOT NULL,
    "affects_nights" BOOLEAN NOT NULL,
    "isSystem" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nurseRestrictionTypeId" TEXT NOT NULL,

    CONSTRAINT "nurse_restrictions_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "optimization_scores" (
    "id" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fairness_score" DECIMAL(65,30) NOT NULL,
    "fatigue_score" DECIMAL(65,30) NOT NULL,
    "workload_score" DECIMAL(65,30) NOT NULL,
    "overtime_score" DECIMAL(65,30),
    "preference_score" DECIMAL(65,30),
    "overall_score" DECIMAL(65,30),
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "optimization_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "specialities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_distribution_rules" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,

    CONSTRAINT "monthly_distribution_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" "ProviderList" NOT NULL,
    "configuration" JSONB NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "response" JSONB NOT NULL,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" "PriorityTypes" NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "NotificationCategoryTypes" NOT NULL,
    "priority" "PriorityTypes" NOT NULL,
    "templateId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "notification_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title_template" TEXT NOT NULL,
    "body_template" TEXT NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT,
    "rolesId" TEXT,
    "status" "NurseStatusType" NOT NULL,
    "refreshToken" TEXT NOT NULL DEFAULT '',
    "lastLoginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auditLogId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "action" "ActionAuditLogTypes" NOT NULL,
    "moduleId" TEXT NOT NULL,
    "old_value" JSONB NOT NULL DEFAULT '{}',
    "new_value" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permisionId" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permisionId")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurse_preferences" (
    "id" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "preferredShift" "PreferredShift" NOT NULL DEFAULT 'MORNING',
    "avoid_shifts" "PreferredShift" NOT NULL DEFAULT 'NIGHT',
    "maxNigthsPerMonth" INTEGER NOT NULL DEFAULT 10,
    "maxDaysPerMonth" INTEGER NOT NULL DEFAULT 15,
    "preferredDaysOff" INTEGER NOT NULL DEFAULT 10,
    "prefersWeekendsOff" BOOLEAN NOT NULL DEFAULT false,
    "allowOvertime" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nurse_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration_hours" TIMESTAMP(3) NOT NULL,
    "color" TEXT NOT NULL,
    "departmentId" TEXT,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_coverages" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT,
    "shiftId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "priority" "PriorityTypes" NOT NULL,
    "statuts" "VacationStatus" NOT NULL,
    "rank" INTEGER,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "fatigueRisk" DOUBLE PRECISION,
    "overtimeRisk" DOUBLE PRECISION,
    "compatibilityScore" DOUBLE PRECISION,
    "aiRecommendation" JSONB,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nurseId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "emergency_coverages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_candidates" (
    "id" TEXT NOT NULL,
    "coverageId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "score" DECIMAL(65,30) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "selected" BOOLEAN NOT NULL,

    CONSTRAINT "emergency_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_templates" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "shift_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_change_requests" (
    "id" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'AWAITING_OTHER_NURSE',
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT,
    "sourceShiftId" TEXT NOT NULL,
    "targetShiftId" TEXT,
    "approverId" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_change_approvals" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "approverId" TEXT,
    "decision" "ChangeApprovalsTypes" NOT NULL DEFAULT 'PENDING',
    "comments" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "shift_change_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_change_documents" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "shift_change_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_rules" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "value" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "work_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_rule_conditions" (
    "id" TEXT NOT NULL,
    "workRuleId" TEXT NOT NULL,
    "condintion_type" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "work_rule_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkRuleActions" (
    "id" TEXT NOT NULL,
    "workRuleId" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "action_value" TEXT NOT NULL,

    CONSTRAINT "WorkRuleActions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_groups" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "rule_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_group_assignments" (
    "id" TEXT NOT NULL,
    "workRuleId" TEXT NOT NULL,
    "ruleGroupId" TEXT NOT NULL,

    CONSTRAINT "rule_group_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaves" (
    "id" TEXT NOT NULL,
    "organiztionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "LeaveType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "rejectionReason" TEXT,
    "emergencyCoverageRequired" BOOLEAN NOT NULL DEFAULT false,
    "affectsSchedule" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "ActivityLogType" NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_settings_organizationId_key" ON "organization_settings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "nurse_profiles_nurseId_key" ON "nurse_profiles"("nurseId");

-- CreateIndex
CREATE UNIQUE INDEX "nurse_restrictions_types_code_key" ON "nurse_restrictions_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_userId_key" ON "notifications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_types_code_key" ON "notification_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_code_key" ON "notification_templates"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "modules_code_key" ON "modules"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "nurse_preferences_nurseId_key" ON "nurse_preferences"("nurseId");

-- AddForeignKey
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_specialties" ADD CONSTRAINT "department_specialties_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_specialties" ADD CONSTRAINT "department_specialties_specialityId_fkey" FOREIGN KEY ("specialityId") REFERENCES "specialities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_configurations" ADD CONSTRAINT "department_configurations_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_alerts" ADD CONSTRAINT "operational_alerts_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "optimization_runs" ADD CONSTRAINT "optimization_runs_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_versions" ADD CONSTRAINT "schedule_versions_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_entries" ADD CONSTRAINT "schedule_entries_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_entries" ADD CONSTRAINT "schedule_entries_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_entries" ADD CONSTRAINT "schedule_entries_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_entries" ADD CONSTRAINT "schedule_entries_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_entries" ADD CONSTRAINT "schedule_entries_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurses" ADD CONSTRAINT "nurses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurses" ADD CONSTRAINT "nurses_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurses" ADD CONSTRAINT "nurses_specialityId_fkey" FOREIGN KEY ("specialityId") REFERENCES "specialities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurses" ADD CONSTRAINT "nurses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_reporterById_fkey" FOREIGN KEY ("reporterById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_availability" ADD CONSTRAINT "nurse_availability_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_availability" ADD CONSTRAINT "nurse_availability_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workload_metrics" ADD CONSTRAINT "workload_metrics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workload_metrics" ADD CONSTRAINT "workload_metrics_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacations" ADD CONSTRAINT "vacations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacations" ADD CONSTRAINT "vacations_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacations" ADD CONSTRAINT "vacations_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_profiles" ADD CONSTRAINT "nurse_profiles_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_profiles" ADD CONSTRAINT "nurse_profiles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseRestriction" ADD CONSTRAINT "NurseRestriction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseRestriction" ADD CONSTRAINT "NurseRestriction_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseRestriction" ADD CONSTRAINT "NurseRestriction_restrictionTypeId_fkey" FOREIGN KEY ("restrictionTypeId") REFERENCES "nurse_restrictions_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseRestriction" ADD CONSTRAINT "NurseRestriction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "optimization_scores" ADD CONSTRAINT "optimization_scores_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "optimization_scores" ADD CONSTRAINT "optimization_scores_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_distribution_rules" ADD CONSTRAINT "monthly_distribution_rules_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_distribution_rules" ADD CONSTRAINT "monthly_distribution_rules_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_types" ADD CONSTRAINT "notification_types_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "notification_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_rolesId_fkey" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permisionId_fkey" FOREIGN KEY ("permisionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_preferences" ADD CONSTRAINT "nurse_preferences_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_preferences" ADD CONSTRAINT "nurse_preferences_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_coverages" ADD CONSTRAINT "emergency_coverages_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_coverages" ADD CONSTRAINT "emergency_coverages_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_coverages" ADD CONSTRAINT "emergency_coverages_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_coverages" ADD CONSTRAINT "emergency_coverages_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_candidates" ADD CONSTRAINT "emergency_candidates_coverageId_fkey" FOREIGN KEY ("coverageId") REFERENCES "emergency_coverages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_candidates" ADD CONSTRAINT "emergency_candidates_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_templates" ADD CONSTRAINT "shift_templates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_templates" ADD CONSTRAINT "shift_templates_id_fkey" FOREIGN KEY ("id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_requests" ADD CONSTRAINT "shift_change_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_requests" ADD CONSTRAINT "shift_change_requests_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_requests" ADD CONSTRAINT "shift_change_requests_sourceShiftId_fkey" FOREIGN KEY ("sourceShiftId") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_requests" ADD CONSTRAINT "shift_change_requests_targetShiftId_fkey" FOREIGN KEY ("targetShiftId") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_requests" ADD CONSTRAINT "shift_change_requests_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_approvals" ADD CONSTRAINT "shift_change_approvals_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_approvals" ADD CONSTRAINT "shift_change_approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_approvals" ADD CONSTRAINT "shift_change_approvals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_documents" ADD CONSTRAINT "shift_change_documents_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_rules" ADD CONSTRAINT "work_rules_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_rule_conditions" ADD CONSTRAINT "work_rule_conditions_workRuleId_fkey" FOREIGN KEY ("workRuleId") REFERENCES "work_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkRuleActions" ADD CONSTRAINT "WorkRuleActions_workRuleId_fkey" FOREIGN KEY ("workRuleId") REFERENCES "work_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_groups" ADD CONSTRAINT "rule_groups_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_group_assignments" ADD CONSTRAINT "rule_group_assignments_workRuleId_fkey" FOREIGN KEY ("workRuleId") REFERENCES "work_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_group_assignments" ADD CONSTRAINT "rule_group_assignments_ruleGroupId_fkey" FOREIGN KEY ("ruleGroupId") REFERENCES "rule_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_organiztionId_fkey" FOREIGN KEY ("organiztionId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
