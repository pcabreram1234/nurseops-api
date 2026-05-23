-- ==============================================================================
-- 1. CONFIGURACIONES GLOBALES Y BANDERAS (No dependen de llaves foráneas)
-- ==============================================================================

INSERT INTO "SystemConfiguration" ("id", "key", "value") VALUES
('sys-01', 'MAX_MONTHLY_HOURS', '160'),
('sys-02', 'MIN_REST_HOURS', '12'),
('sys-03', 'ALLOW_DOUBLE_SHIFT', 'false'),
('sys-04', 'DEFAULT_SHIFT_DURATION', '8'),
('sys-05', 'ENABLE_BIRTHDAY_DAY_OFF', 'true'),
('sys-06', 'AUTO_APPROVE_SHIFT_CHANGES', 'false'),
('sys-07', 'MAX_CONSECUTIVE_NIGHTS', '3'),
('sys-08', 'OVERTIME_LIMIT', '20'),
('sys-09', 'FATIGUE_ALERT_THRESHOLD', '85'),
('sys-10', 'EMERGENCY_COVERAGE_BONUS', 'true');

INSERT INTO "FeatureFlag" ("id", "feature_name", "isActive") VALUES
('ff-01', 'AUTO_SCHEDULING', true),
('ff-02', 'SHIFT_SWAP_AUTOMATION', true),
('ff-03', 'AI_FATIGUE_ANALYSIS', true),
('ff-04', 'WHATSAPP_NOTIFICATIONS', true),
('ff-05', 'EMERGENCY__AI', false),
('ff-06', 'DARK_MODE', true),
('ff-07', 'MULTI_BRANCH_SUPPORT', true),
('ff-08', 'PAYROLL_INTEGRATION', false),
('ff-09', 'ADVANCED_METRICS', true),
('ff-10', 'BIOMETRIC_SYNC', false);

-- ==============================================================================
-- 2. ESTRUCTURA ORGANIZACIONAL
-- ==============================================================================

INSERT INTO "branches" ("id", "organizationId", "name", "address", "city", "state", "country", "zipCode", "phone", "email", "latitude", "longitude", "isMainBranch") VALUES
('branch-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Sede Central', 'Av. 27 de Febrero', 'Santo Domingo', 'Distrito Nacional', 'RD', '10101', '809-555-0001', 'hq@hospital.com', 18.4861, -69.9312, true),
('branch-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Clínica Norte', 'Av. John F. Kennedy', 'Santo Domingo', 'Distrito Nacional', 'RD', '10102', '809-555-0002', 'norte@hospital.com', 18.4900, -69.9400, false),
('branch-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Anexo Pediátrico', 'Calle Paseo', 'Santiago', 'Santiago', 'RD', '51000', '809-555-0003', 'pediatria@hospital.com', 19.4500, -70.7000, false),
('branch-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Centro Traumatológico', 'Av. Las Américas', 'Santo Domingo Este', 'SD', 'RD', '11501', '809-555-0004', 'trauma@hospital.com', 18.4700, -69.8500, false),
('branch-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Unidad Oncológica', 'Calle 5', 'Santo Domingo', 'Distrito Nacional', 'RD', '10105', '809-555-0005', 'onco@hospital.com', 18.4600, -69.9200, false),
('branch-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Clínica Sur', 'Av. Independencia', 'Santo Domingo', 'Distrito Nacional', 'RD', '10106', '809-555-0006', 'sur@hospital.com', 18.4500, -69.9100, false),
('branch-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Centro Materno', 'Av. Bolívar', 'Santo Domingo', 'Distrito Nacional', 'RD', '10107', '809-555-0007', 'materno@hospital.com', 18.4750, -69.9250, false),
('branch-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Anexo Psiquiátrico', 'Km 28', 'Pedro Brand', 'SD', 'RD', '11701', '809-555-0008', 'psiq@hospital.com', 18.5500, -70.0500, false),
('branch-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Unidad de Rehabilitación', 'Av. Luperón', 'Santo Domingo Oeste', 'SD', 'RD', '11601', '809-555-0009', 'rehab@hospital.com', 18.4800, -69.9800, false),
('branch-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Dispensario Médico', 'Zona Colonial', 'Santo Domingo', 'Distrito Nacional', 'RD', '10210', '809-555-0010', 'dispensario@hospital.com', 18.4700, -69.8800, false);

INSERT INTO "departments" ("id", "name", "organizationId", "code", "description", "branchId", "type", "criticalLevel", "minimum_staff", "optimalStaff", "maxCapacity", "allowOvertime") VALUES
('dept-01', 'Cuidados Intensivos', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'ICU-01', 'UCI Principal', 'branch-01', 'ICU', 'CRITICAL', 5, 8, 20, true),
('dept-02', 'Emergencias', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'ER-01', 'Sala de Emergencias', 'branch-01', 'ER', 'CRITICAL', 8, 12, 50, true),
('dept-03', 'Pediatría', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'PED-01', 'Área Infantil', 'branch-03', 'PEDIATRICS', 'MEDIUM', 4, 6, 30, false),
('dept-04', 'Cirugía General', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'SUR-01', 'Quirófanos', 'branch-01', 'SURGERY', 'HIGH', 6, 10, 15, true),
('dept-05', 'Cardiología', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'CAR-01', 'Pabellón Cardíaco', 'branch-01', 'CARDIOLOGY', 'HIGH', 3, 5, 20, true),
('dept-06', 'Maternidad', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'MAT-01', 'Sala de Partos', 'branch-07', 'MATERNITY', 'HIGH', 4, 7, 25, true),
('dept-07', 'Oncología', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'ONC-01', 'Tratamiento de Cáncer', 'branch-05', 'ONCOLOGY', 'MEDIUM', 3, 5, 15, false),
('dept-08', 'Traumatología', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'TRA-01', 'Atención de Traumas', 'branch-04', 'TRAUMA', 'HIGH', 5, 8, 40, true),
('dept-09', 'Medicina Interna', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'INT-01', 'Hospitalización General', 'branch-01', 'INTERNAL_MEDICINE', 'LOW', 3, 5, 60, false),
('dept-10', 'Radiología', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'RAD-01', 'Imágenes Médicas', 'branch-02', 'RADIOLOGY', 'LOW', 2, 4, 10, false);

INSERT INTO "department_configurations" ("id", "organizationId", "departmentId", "max_nights", "minimum_staff_per_shift", "allow_externeal_support", "allow_double_shift") VALUES
('dconf-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-01', 4, 5, false, false),
('dconf-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-02', 6, 8, true, true),
('dconf-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-03', 4, 4, true, false),
('dconf-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-04', 3, 6, false, false),
('dconf-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-05', 4, 3, false, false),
('dconf-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-06', 5, 4, true, true),
('dconf-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-07', 2, 3, false, false),
('dconf-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-08', 5, 5, true, true),
('dconf-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-09', 4, 3, true, false),
('dconf-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-10', 3, 2, false, false);

-- ==============================================================================
-- 3. ESPECIALIDADES Y ROLES
-- ==============================================================================

INSERT INTO "specialities" ("id", "name", "organizationId", "code", "description") VALUES
('spec-01', 'Intensivista', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'SP-ICU', 'Especialista en cuidados críticos'),
('spec-02', 'Emergenciólogo', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'SP-ER', 'Atención rápida y trauma'),
('spec-03', 'Pediatra Neonatal', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'SP-PED', 'Cuidado de recién nacidos'),
('spec-04', 'Instrumentista', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'SP-SURG', 'Asistencia en quirófano'),
('spec-05', 'Cardiología Clínica', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'SP-CARD', 'Cuidado cardíaco avanzado'),
('spec-06', 'Obstetricia', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'SP-OB', 'Cuidados maternos'),
('spec-07', 'Oncología Médica', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'SP-ONC', 'Manejo de quimioterapia'),
('spec-08', 'Ortopedia', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'SP-ORT', 'Manejo de fracturas'),
('spec-09', 'Geriatría', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'SP-GER', 'Cuidado de adultos mayores'),
('spec-10', 'Radiología Intervencionista', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'SP-RAD', 'Procedimientos guiados por imagen');

INSERT INTO "department_specialties" ("departmentId", "specialityId", "required", "priority", "minimum_staff") VALUES
('dept-01', 'spec-01', true, 1, 2),
('dept-02', 'spec-02', true, 1, 3),
('dept-03', 'spec-03', true, 1, 2),
('dept-04', 'spec-04', true, 1, 2),
('dept-05', 'spec-05', true, 1, 1),
('dept-06', 'spec-06', true, 1, 2),
('dept-07', 'spec-07', true, 1, 1),
('dept-08', 'spec-08', true, 1, 2),
('dept-09', 'spec-09', false, 2, 1),
('dept-10', 'spec-10', true, 1, 1);

INSERT INTO "roles" ("id", "name", "organizationId") VALUES
('role-01', 'SUPERVISOR_GENERAL', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca'),
('role-02', 'NURSE_SENIOR', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca'),
('role-03', 'NURSE_JUNIOR', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca'),
('role-04', 'HR_MANAGER', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca'),
('role-05', 'SYSTEM_ADMIN', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca'),
('role-06', 'DEPARTMENT_HEAD', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca'),
('role-07', 'NIGHT_SUPERVISOR', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca'),
('role-08', 'TEMP_NURSE', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca'),
('role-09', 'AUDITOR', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca'),
('role-10', 'READ_ONLY_VIEWER', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca');

-- ==============================================================================
-- 4. USUARIOS, ENFERMERAS Y PERFILES
-- ==============================================================================

INSERT INTO "users" ("id", "email", "password", "firstName", "lastName", "organizationId", "departmentId", "rolesId", "status", "auditLogId") VALUES
('user-01', 'maria.perez@hgc.com', 'hashed123', 'Maria', 'Perez', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-01', 'role-02', 'ACTIVE', 'audit-01'),
('user-02', 'juan.gomez@hgc.com', 'hashed123', 'Juan', 'Gomez', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-02', 'role-03', 'ACTIVE', 'audit-02'),
('user-03', 'ana.lopez@hgc.com', 'hashed123', 'Ana', 'Lopez', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-03', 'role-02', 'ACTIVE', 'audit-03'),
('user-04', 'carlos.ruiz@hgc.com', 'hashed123', 'Carlos', 'Ruiz', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-04', 'role-06', 'ACTIVE', 'audit-04'),
('user-05', 'luisa.fernandez@hgc.com', 'hashed123', 'Luisa', 'Fernandez', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-05', 'role-03', 'ACTIVE', 'audit-05'),
('user-06', 'pedro.martinez@hgc.com', 'hashed123', 'Pedro', 'Martinez', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-06', 'role-08', 'ACTIVE', 'audit-06'),
('user-07', 'laura.diaz@hgc.com', 'hashed123', 'Laura', 'Diaz', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-07', 'role-02', 'ACTIVE', 'audit-07'),
('user-08', 'jorge.torres@hgc.com', 'hashed123', 'Jorge', 'Torres', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-08', 'role-03', 'ACTIVE', 'audit-08'),
('user-09', 'carmen.vargas@hgc.com', 'hashed123', 'Carmen', 'Vargas', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-09', 'role-07', 'ACTIVE', 'audit-09'),
('user-10', 'miguel.castro@hgc.com', 'hashed123', 'Miguel', 'Castro', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-10', 'role-02', 'ACTIVE', 'audit-10');

INSERT INTO "nurses" ("id", "userId", "departmentId", "organizationId", "contract_type", "hire_date", "status", "specialityId") VALUES
('nurse-01', 'user-01', 'dept-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'PERMANENT', '2020-01-15', 'ACTIVE', 'spec-01'),
('nurse-02', 'user-02', 'dept-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'PERMANENT', '2021-03-10', 'ACTIVE', 'spec-02'),
('nurse-03', 'user-03', 'dept-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'PERMANENT', '2019-06-20', 'ACTIVE', 'spec-03'),
('nurse-04', 'user-04', 'dept-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'PERMANENT', '2018-11-05', 'ACTIVE', 'spec-04'),
('nurse-05', 'user-05', 'dept-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'PART_TIME', '2022-02-28', 'ACTIVE', 'spec-05'),
('nurse-06', 'user-06', 'dept-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'TEMPORAL', '2023-08-15', 'ACTIVE', 'spec-06'),
('nurse-07', 'user-07', 'dept-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'PERMANENT', '2017-04-12', 'ACTIVE', 'spec-07'),
('nurse-08', 'user-08', 'dept-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'PER_DIEM', '2023-01-20', 'ACTIVE', 'spec-08'),
('nurse-09', 'user-09', 'dept-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'PERMANENT', '2015-09-30', 'ACTIVE', 'spec-09'),
('nurse-10', 'user-10', 'dept-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'PERMANENT', '2020-12-01', 'ACTIVE', 'spec-10');

INSERT INTO "nurse_profiles" ("id", "nurseId", "organizationId", "birthDate", "emergencyContact", "emergencyContactPhone", "educationLevel", "yearsOfExperience", "health_restrictions") VALUES
('prof-01', 'nurse-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '1985-04-12', 'Jose Perez', '809-111-2222', 'BACHELOR_DEGREE', 10, 'Ninguna'),
('prof-02', 'nurse-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '1992-07-23', 'Marta Gomez', '809-222-3333', 'TECHNICIAN', 4, 'Alergia al látex'),
('prof-03', 'nurse-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '1988-11-05', 'Luis Lopez', '809-333-4444', 'SPECIALIZATION', 8, 'Ninguna'),
('prof-04', 'nurse-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '1980-02-14', 'Sara Ruiz', '809-444-5555', 'MASTER_DEGREE', 15, 'Hipertensión controlada'),
('prof-05', 'nurse-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '1995-09-30', 'Raul Fernandez', '809-555-6666', 'BACHELOR_DEGREE', 3, 'Asma leve'),
('prof-06', 'nurse-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '1998-12-10', 'Elena Martinez', '809-666-7777', 'ASSISTANT', 2, 'Ninguna'),
('prof-07', 'nurse-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '1983-06-25', 'Diego Diaz', '809-777-8888', 'SPECIALIZATION', 12, 'Migrañas ocasionales'),
('prof-08', 'nurse-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '1990-03-18', 'Rosa Torres', '809-888-9999', 'TECHNICIAN', 5, 'Ninguna'),
('prof-09', 'nurse-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '1975-08-08', 'Hugo Vargas', '809-999-0000', 'MASTER_DEGREE', 20, 'Problemas de rodilla'),
('prof-10', 'nurse-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '1987-01-20', 'Clara Castro', '809-000-1111', 'BACHELOR_DEGREE', 9, 'Ninguna');

INSERT INTO "nurse_preferences" ("id", "nurseId", "organizationId", "preferredShift", "avoid_shifts", "maxNigthsPerMonth", "maxDaysPerMonth", "preferredDaysOff", "prefersWeekendsOff", "allowOvertime") VALUES
('pref-01', 'nurse-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'MORNING', 'NIGHT', 2, 20, 8, true, false),
('pref-02', 'nurse-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'AFTERNOON', 'MORNING', 6, 22, 6, false, true),
('pref-03', 'nurse-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'MORNING', 'NIGHT', 0, 20, 8, true, false),
('pref-04', 'nurse-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'AFTERNOON', 'NIGHT', 4, 18, 10, true, true),
('pref-05', 'nurse-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'NIGHT', 'MORNING', 12, 15, 12, false, true),
('pref-06', 'nurse-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'AFTERNOON', 'NIGHT', 4, 20, 8, false, true),
('pref-07', 'nurse-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'MORNING', 'NIGHT', 2, 20, 8, true, false),
('pref-08', 'nurse-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'AFTERNOON', 'MORNING', 8, 20, 8, false, true),
('pref-09', 'nurse-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'MORNING', 'NIGHT', 0, 15, 12, true, false),
('pref-10', 'nurse-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'NIGHT', 'AFTERNOON', 10, 18, 10, false, true);

-- ==============================================================================
-- 5. RESTRICCIONES Y REGLAS
-- ==============================================================================

INSERT INTO "nurse_restrictions_types" ("id", "code", "name", "description", "severity", "affects_scheduler", "affects_overtime", "affects_nights", "isSystem", "isActive", "nurseRestrictionTypeId") VALUES
('restype-01', 'R-001', 'NO_NIGHT_SHIFTS', 'NO_PUEDE_HACER_AMANECIDAS', 'HIGH', true, false, true, true, true, 'base-01'),
('restype-02', 'R-002', 'NO_OVERTIME', 'NO_OVERTIME', 'MEDIUM', true, true, false, true, true, 'base-02'),
('restype-03', 'R-003', 'NO_WEEKENDS', 'NO_TRABAJA_FINES_DE_SEMANA', 'HIGH', true, false, false, true, true, 'base-03'),
('restype-04', 'R-004', 'MAX_40_HOURS_WEEK', 'MAXIMO_40H', 'CRITICAL', true, true, false, true, true, 'base-04'),
('restype-05', 'R-005', 'MEDICAL_RESTRICTION', 'RESTRICCION_MEDICA_GENERAL', 'CRITICAL', true, true, true, true, true, 'base-05'),
('restype-06', 'R-006', 'PREGNANCY_RESTRICTION', 'RESTRICCION_EMBARAZO', 'CRITICAL', true, true, true, true, true, 'base-06'),
('restype-07', 'R-007', 'ONLY_DAY_SHIFTS', 'SOLO_TRABAJA_DIAS', 'HIGH', true, false, true, true, true, 'base-07'),
('restype-08', 'R-008', 'NO_DOUBLE_SHIFTS', 'NO_PUEDE_HACER_DOBLE_TURNO', 'HIGH', true, false, false, true, true, 'base-08'),
('restype-09', 'R-009', 'NO_CONSECUTIVE_NIGHTS', 'NO_NOCHES_CONSECUTIVAS', 'MEDIUM', true, false, true, true, true, 'base-09'),
('restype-10', 'R-010', 'PART_TIME_ONLY', 'SOLO_MEDIO_TIEMPO', 'HIGH', true, true, false, true, true, 'base-10');

INSERT INTO "NurseRestriction" ("id", "organizationId", "nurseId", "restrictionTypeId", "isTemporary", "isActive") VALUES
('nrest-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-03', 'restype-01', false, true),
('nrest-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-09', 'restype-05', true, true),
('nrest-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-04', 'restype-08', false, true),
('nrest-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-01', 'restype-02', false, true),
('nrest-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-07', 'restype-06', true, true),
('nrest-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-05', 'restype-10', false, true),
('nrest-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-06', 'restype-09', false, true),
('nrest-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-10', 'restype-04', false, true),
('nrest-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-02', 'restype-03', true, true),
('nrest-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-08', 'restype-07', false, true);

-- ==============================================================================
-- 6. TURNOS Y TEMPLATES
-- ==============================================================================

INSERT INTO "shifts" ("id", "organizationId", "name", "code", "type", "startTime", "endTime", "durationHours", "departmentId") VALUES
('sh-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Mañana Normal', 'M-01', 'MORNING', '2026-06-01 07:00:00', '2026-06-01 15:00:00', '1970-01-01 08:00:00', 'dept-01'),
('sh-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Tarde Normal', 'T-01', 'AFTERNOON', '2026-06-01 15:00:00', '2026-06-01 23:00:00', '1970-01-01 08:00:00', 'dept-01'),
('sh-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Noche Normal', 'N-01', 'NIGHT', '2026-06-01 23:00:00', '2026-06-02 07:00:00', '1970-01-01 08:00:00', 'dept-01'),
('sh-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Guardia 12h Día', 'G12-D', 'MORNING', '2026-06-01 07:00:00', '2026-06-01 19:00:00', '1970-01-01 12:00:00', 'dept-02'),
('sh-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Guardia 12h Noche', 'G12-N', 'NIGHT', '2026-06-01 19:00:00', '2026-06-02 07:00:00', '1970-01-01 12:00:00', 'dept-02'),
('sh-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Soporte Corto', 'S-01', 'MORNING', '2026-06-01 08:00:00', '2026-06-01 12:00:00', '1970-01-01 04:00:00', 'dept-03'),
('sh-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Turno Quirófano A', 'Q-01', 'MORNING', '2026-06-01 06:00:00', '2026-06-01 14:00:00', '1970-01-01 08:00:00', 'dept-04'),
('sh-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Turno Quirófano B', 'Q-02', 'AFTERNOON', '2026-06-01 14:00:00', '2026-06-01 22:00:00', '1970-01-01 08:00:00', 'dept-04'),
('sh-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Refuerzo Noche', 'RN-01', 'NIGHT', '2026-06-01 20:00:00', '2026-06-02 04:00:00', '1970-01-01 08:00:00', 'dept-05'),
('sh-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Jornada Completa', 'JC-01', 'MORNING', '2026-06-01 08:00:00', '2026-06-01 17:00:00', '1970-01-01 09:00:00', 'dept-09');

INSERT INTO "shift_templates" ("id", "organizationId", "departmentId", "name", "description", "configuration", "startTime", "endTime") VALUES
('tmpl-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-01', 'Patrón UCI 8h', '3 turnos de 8 horas', '{"required_staff": 3}', '07:00', '15:00'),
('tmpl-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-02', 'Patrón ER 12h', '2 turnos de 12 horas', '{"required_staff": 4}', '07:00', '19:00'),
('tmpl-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-03', 'Patrón Pediatría', 'Lunes a Viernes', '{"required_staff": 2}', '08:00', '16:00'),
('tmpl-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-04', 'Plantilla Quirófano', 'Alta demanda matutina', '{"required_staff": 5}', '06:00', '14:00'),
('tmpl-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-05', 'Cardio Regular', 'Turno estándar', '{"required_staff": 2}', '07:00', '15:00'),
('tmpl-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-06', 'Maternidad 24/7', 'Cobertura completa', '{"required_staff": 3}', '23:00', '07:00'),
('tmpl-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-07', 'Oncología Día', 'Solo diurno', '{"required_staff": 2}', '08:00', '17:00'),
('tmpl-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-08', 'Trauma Refuerzo', 'Refuerzo fines semana', '{"required_staff": 4}', '19:00', '07:00'),
('tmpl-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-09', 'Medicina Interna Base', 'Cobertura pabellón', '{"required_staff": 3}', '07:00', '15:00'),
('tmpl-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-10', 'Radiología Corto', 'Medio tiempo', '{"required_staff": 1}', '08:00', '12:00');

-- ==============================================================================
-- 7. EVENTOS DE TIEMPO (Ausencias, Vacaciones, Disponibilidad, Permisos)
-- ==============================================================================

INSERT INTO "absences" ("id", "nurseId", "organizationId", "date", "type", "reason", "reporterById") VALUES
('abs-01', 'nurse-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '2026-06-05 00:00:00', 'SICKNESS', 'Fiebre alta', 'user-01'),
('abs-02', 'nurse-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '2026-06-12 00:00:00', 'PERSONAL', 'Asunto familiar', 'user-02'),
('abs-03', 'nurse-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '2026-06-15 00:00:00', 'MEDICAL_LICENSE', 'Cita médica', 'user-03'),
('abs-04', 'nurse-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '2026-06-18 00:00:00', 'EMERGENCY', 'Emergencia en casa', 'user-04'),
('abs-05', 'nurse-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '2026-06-20 00:00:00', 'SICKNESS', 'Migraña severa', 'user-05'),
('abs-06', 'nurse-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '2026-06-22 00:00:00', 'UNJUSTIFIED', 'No se presentó', 'user-01'),
('abs-07', 'nurse-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '2026-06-25 00:00:00', 'PERSONAL', 'Trámites legales', 'user-07'),
('abs-08', 'nurse-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '2026-06-28 00:00:00', 'SICKNESS', 'Gastroenteritis', 'user-08'),
('abs-09', 'nurse-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '2026-06-30 00:00:00', 'MEDICAL_LICENSE', 'Terapia física', 'user-09'),
('abs-10', 'nurse-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', '2026-06-10 00:00:00', 'EMERGENCY', 'Accidente de tránsito leve', 'user-10');

INSERT INTO "nurse_availability" ("id", "organizationId", "nurseId", "date", "status") VALUES
('av-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-01', '2026-06-01 00:00:00', 'AVAILABLE'),
('av-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-02', '2026-06-02 00:00:00', 'PARTIAL'),
('av-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-03', '2026-06-03 00:00:00', 'NOT_AVAILABLE'),
('av-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-04', '2026-06-04 00:00:00', 'AVAILABLE'),
('av-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-05', '2026-06-05 00:00:00', 'AVAILABLE'),
('av-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-06', '2026-06-06 00:00:00', 'PARTIAL'),
('av-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-07', '2026-06-07 00:00:00', 'NOT_AVAILABLE'),
('av-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-08', '2026-06-08 00:00:00', 'AVAILABLE'),
('av-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-09', '2026-06-09 00:00:00', 'AVAILABLE'),
('av-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-10', '2026-06-10 00:00:00', 'PARTIAL');

INSERT INTO "vacations" ("id", "organizationId", "nurseId", "start_Date", "end_Date", "status", "reason", "notes") VALUES
('vac-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-01', '2026-07-01 00:00:00', '2026-07-15 00:00:00', 'APPROVED', 'Vacaciones anuales', 'Aprobado por HR'),
('vac-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-02', '2026-08-10 00:00:00', '2026-08-25 00:00:00', 'PENDING_APPROVAL', 'Descanso', ''),
('vac-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-03', '2026-09-01 00:00:00', '2026-09-14 00:00:00', 'APPROVED', 'Viaje familiar', ''),
('vac-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-04', '2026-10-05 00:00:00', '2026-10-20 00:00:00', 'APPROVED', 'Vacaciones anuales', ''),
('vac-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-05', '2026-11-15 00:00:00', '2026-11-30 00:00:00', 'REJECTED', 'Choque con temporada alta', 'Reprogramar'),
('vac-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-06', '2026-12-01 00:00:00', '2026-12-15 00:00:00', 'APPROVED', 'Vacaciones anuales', ''),
('vac-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-07', '2027-01-10 00:00:00', '2027-01-25 00:00:00', 'DRAFT', 'Descanso', ''),
('vac-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-08', '2027-02-05 00:00:00', '2027-02-20 00:00:00', 'PENDING_APPROVAL', 'Vacaciones anuales', ''),
('vac-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-09', '2027-03-15 00:00:00', '2027-03-30 00:00:00', 'APPROVED', 'Viaje', ''),
('vac-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'nurse-10', '2027-04-01 00:00:00', '2027-04-15 00:00:00', 'APPROVED', 'Vacaciones anuales', '');

INSERT INTO "leaves" ("id", "organiztionId", "userId", "type", "startDate", "endDate", "reason", "status") VALUES
('lv-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'user-01', 'MATERNITY', '2026-05-01 00:00:00', '2026-08-01 00:00:00', 'Licencia pre-natal', 'APPROVED'),
('lv-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'user-02', 'STUDY', '2026-06-01 00:00:00', '2026-06-05 00:00:00', 'Congreso médico', 'APPROVED'),
('lv-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'user-03', 'BEREAVEMENT', '2026-06-10 00:00:00', '2026-06-13 00:00:00', 'Fallecimiento familiar', 'APPROVED'),
('lv-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'user-04', 'UNPAID', '2026-07-01 00:00:00', '2026-07-30 00:00:00', 'Asuntos personales', 'PENDING'),
('lv-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'user-05', 'PATERNITY', '2026-08-15 00:00:00', '2026-08-22 00:00:00', 'Nacimiento hijo', 'APPROVED'),
('lv-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'user-06', 'SICK', '2026-06-05 00:00:00', '2026-06-25 00:00:00', 'Cirugía menor', 'APPROVED'),
('lv-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'user-07', 'UNION', '2026-06-15 00:00:00', '2026-06-16 00:00:00', 'Reunión sindical', 'APPROVED'),
('lv-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'user-08', 'STUDY', '2026-09-01 00:00:00', '2026-12-01 00:00:00', 'Diplomado especialización', 'PENDING'),
('lv-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'user-09', 'UNPAID', '2026-10-01 00:00:00', '2026-10-15 00:00:00', 'Viaje personal', 'REJECTED'),
('lv-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'user-10', 'BEREAVEMENT', '2026-05-20 00:00:00', '2026-05-23 00:00:00', 'Fallecimiento', 'APPROVED');

-- ==============================================================================
-- 8. REGLAS DE NEGOCIO Y MOTOR LOGICO
-- ==============================================================================

INSERT INTO "permissions" ("id", "name", "description") VALUES
-- Permisos Originales
('perm-01', 'CREATE_SCHEDULE', 'Permite generar horarios'),
('perm-02', 'EDIT_SCHEDULE', 'Permite modificar turnos'),
('perm-03', 'APPROVE_VACATION', 'Aprobar vacaciones'),
('perm-04', 'VIEW_REPORTS', 'Ver métricas y reportes'),
('perm-05', 'MANAGE_USERS', 'Crear y editar usuarios'),
('perm-06', 'MANAGE_ROLES', 'Configurar roles'),
('perm-07', 'OVERRIDE_RULES', 'Saltarse advertencias del sistema'),
('perm-08', 'APPROVE_SWAPS', 'Aprobar cambios de turno'),
('perm-09', 'VIEW_ALL_DEPARTMENTS', 'Visibilidad global'),
('perm-10', 'EXPORT_DATA', 'Exportar a Excel/PDF'),

-- Auditoría
('perm-11', 'WRITE_AUDIT_LOGS', 'Registrar eventos en la bitácora de auditoría del sistema'),
('perm-12', 'READ_AUDIT_LOGS', 'Consultar y leer registros de auditoría'),

-- Gestión de Usuarios y Accesos
('perm-13', 'CREATE_USER', 'Registrar nuevos usuarios en el sistema'),
('perm-14', 'CHANGE_PASSWORD', 'Modificar o resetear contraseñas de usuarios'),

-- Gestión de Sucursales (Branches)
('perm-15', 'CREATE_BRANCH', 'Crear nuevas sucursales o sedes'),
('perm-16', 'VIEW_BRANCHES', 'Ver el listado completo de sucursales'),
('perm-17', 'VIEW_BRANCH', 'Ver los detalles de una sucursal específica'),
('perm-18', 'UPDATE_BRANCH', 'Modificar la información de una sucursal'),
('perm-19', 'DELETE_BRANCH', 'Eliminar o desactivar una sucursal'),

-- Gestión de Departamentos
('perm-20', 'CREATE_DEPARTMENT', 'Registrar nuevos departamentos o áreas'),
('perm-21', 'VIEW_DEPARTMENTS', 'Ver el listado completo de departamentos'),
('perm-22', 'VIEW_DEPARTMENT', 'Ver los detalles de un departamento específico'),
('perm-23', 'UPDATE_DEPARTMENT', 'Modificar la configuración de un departamento'),
('perm-24', 'DELETE_DEPARTMENT', 'Eliminar o archivar un departamento'),
('perm-25', 'ASSIGN_NURSES_DEPARTMENT', 'Asignar personal de enfermería a departamentos'),

-- Candidatos a Emergencias
('perm-26', 'CREATE_EMERGENCY_CANDIDATE', 'Registrar personal disponible para coberturas de emergencia'),
('perm-27', 'VIEW_EMERGENCY_CANDIDATES', 'Ver lista de candidatos para turnos de emergencia'),
('perm-28', 'UPDATE_EMERGENCY_CANDIDATE', 'Actualizar estatus de candidatos de emergencia'),

-- Configuración del Sistema (Feature Flags y Módulos)
('perm-29', 'MANAGE_FEATURE_FLAGS', 'Activar o desactivar características globales del sistema'),
('perm-30', 'VIEW_FEATURE_FLAGS', 'Ver el estado de las características del sistema (Feature Flags)'),
('perm-31', 'MANAGE_SYSTEM_MODULES', 'Administrar la disponibilidad de los módulos del sistema'),
('perm-32', 'VIEW_SYSTEM_MODULES', 'Ver el estado y configuración de los módulos del sistema'),

-- Gestión de Ausencias (Leaves)
('perm-33', 'CREATE_LEAVE', 'Registrar permisos médicos, licencias o ausencias'),
('perm-34', 'VIEW_LEAVES', 'Ver historial y solicitudes de ausencias'),
('perm-35', 'UPDATE_LEAVE', 'Modificar, aprobar o rechazar solicitudes de ausencia'),

-- Plantillas de Notificación
('perm-36', 'CREATE_NOTIFICATION_TEMPLATE', 'Crear nuevas plantillas para correos/SMS/Push'),
('perm-37', 'FIND_ALL_NOTIFICATIONS_TEMPLATES', 'Ver el listado de plantillas de notificación'),
('perm-38', 'FIND_ONE_NOTIFICATION_TEMPLATE', 'Ver configuración de una plantilla de notificación'),
('perm-39', 'UPDATE_NOTIFICATION_TEMPLATE', 'Modificar texto o variables de una plantilla de notificación'),
('perm-40', 'DELETE_NOTIFICATION_TEMPLATE', 'Eliminar plantillas de notificación'),

-- Disponibilidad de Enfermería
('perm-41', 'CREATE_NURSE_AVAILABILITY', 'Registrar bloqueos o disponibilidad del personal'),
('perm-42', 'VIEW_NURSE_AVAILABILITY', 'Consultar disponibilidad general de enfermeras'),
('perm-43', 'UPDATE_NURSE_AVAILABILITY', 'Ajustar la disponibilidad o preferencias de turnos'),

-- Perfiles Clínicos
('perm-44', 'CREATE_NURSE_PROFILE', 'Crear expediente y perfil técnico de enfermería'),
('perm-45', 'VIEW_NURSE_PROFILES', 'Ver listado de perfiles técnicos'),
('perm-46', 'VIEW_NURSE_PROFILE', 'Ver expediente completo de una enfermera'),
('perm-47', 'UPDATE_NURSE_PROFILE', 'Modificar certificaciones, notas o datos del perfil'),

-- Restricciones Laborales
('perm-48', 'CREATE_NURSE_RESTRICTION', 'Aplicar una regla o restricción temporal/permanente a un recurso'),
('perm-49', 'VIEW_NURSE_RESTRICTIONS', 'Ver las restricciones laborales activas'),
('perm-50', 'UPDATE_NURSE_RESTRICTION', 'Modificar vigencia o tipo de restricción laboral'),
('perm-51', 'DELETE_NURSE_RESTRICTION', 'Levantar o eliminar una restricción laboral'),

-- Gestión Principal de Enfermería (Nurses)
('perm-52', 'CREATE_NURSE', 'Dar de alta a un nuevo empleado de enfermería'),
('perm-53', 'VIEW_NURSES', 'Consultar el padrón general de enfermeras'),
('perm-54', 'VIEW_NURSE', 'Ver datos básicos laborales de la enfermera'),
('perm-55', 'UPDATE_NURSE', 'Actualizar estatus, contrato o tipo de recurso'),
('perm-56', 'DELETE_NURSE', 'Dar de baja a un empleado de enfermería'),

-- Alertas Operativas
('perm-57', 'VIEW_OPERATIONAL_ALERTS', 'Ver alertas de cobertura, fatiga o faltas de personal'),
('perm-58', 'RESOLVE_OPERATIONAL_ALERTS', 'Reconocer o marcar alertas operativas como resueltas'),

-- Motor de Optimización
('perm-59', 'EXECUTE_SCHEDULE_OPTIMIZATION', 'Lanzar el motor algorítmico para generar o mejorar horarios'),
('perm-60', 'VIEW_OPTIMIZATION_METRICS', 'Ver rendimiento y puntajes del motor de distribución'),
('perm-61', 'CREATE_OPTIMIZATION_SCORE', 'Definir nuevas reglas de peso para el algoritmo'),
('perm-62', 'VIEW_OPTIMIZATION_SCORES', 'Consultar las reglas y pesos de asignación algorítmica'),
('perm-63', 'UPDATE_OPTIMIZATION_SCORE', 'Calibrar los pesos e importancia de las reglas de turnos'),

-- Organización
('perm-64', 'CREATE_ORGANIZATION_SETTINGS', 'Inicializar configuración global de la organización'),
('perm-65', 'VIEW_ORGANIZATION_SETTINGS', 'Ver reglas de negocio globales (horas máximas, etc.)'),
('perm-66', 'UPDATE_ORGANIZATION_SETTINGS', 'Modificar parámetros globales de la institución'),
('perm-67', 'CREATE-ORGANIZATION', 'Registrar una nueva entidad/hospital cliente'),
('perm-68', 'READ_ORGANIZATION', 'Ver información fiscal y general del hospital'),
('perm-69', 'UPDATE-ORGANIZATION', 'Actualizar datos de la razón social del hospital'),

-- Entradas Individuales de Turno (Celdas)
('perm-70', 'CREATE_SCHEDULE_ENTRY', 'Asignar un turno a un empleado específico manualmente'),
('perm-71', 'VIEW_SCHEDULE_ENTRIES', 'Ver la matriz de asignaciones de turnos'),
('perm-72', 'UPDATE_SCHEDULE_ENTRY', 'Mover, reasignar o modificar horas de un turno asignado'),

-- Ciclo de Vida del Horario (Schedules)
('perm-73', 'PUBLISH_SCHEDULE', 'Liberar el horario borrador para vista de los empleados'),
('perm-74', 'CREATE_SCHEDULE', 'Inicializar un nuevo bloque mensual o semanal de horario'),
('perm-75', 'VIEW_SCHEDULES', 'Ver el listado histórico de programaciones'),
('perm-76', 'VIEW_SCHEDULE', 'Abrir la vista completa de una programación específica'),
('perm-77', 'UPDATE_SCHEDULE', 'Modificar periodo, estatus o metadata del bloque de horario'),
('perm-78', 'DELETE_SCHEDULE', 'Descartar o eliminar un horario completo'),
('perm-79', 'GENERATE_SCHEDULE', 'Disparar el autollenado de celdas según plantillas'),

-- Solicitudes de Cambio de Turno (Shift Swaps)
('perm-80', 'REQUEST_SHIFT_CHG', 'Pedir un cambio de guardia a un compañero'),
('perm-81', 'VIEW_SHIFT_CHG', 'Ver el panel de solicitudes de intercambio de turnos'),
('perm-82', 'APPROVE_SHIFT_CHG', 'Autorizar o denegar intercambios entre enfermeras'),

-- Documentación Legal de Cambios
('perm-83', 'CREATE_SHIFT_CHANGE_DOCUMENT', 'Generar formato formal/PDF para el intercambio de turnos'),
('perm-84', 'VIEW_ALL_SHIFT_CHANGE_DOCUMENT', 'Ver archivo de formatos de cambio de turnos'),
('perm-85', 'VIEW_SHIFT_CHANGE_DOCUMENT', 'Ver un acta específica de cambio de guardia'),
('perm-86', 'UPDATE_SHIFT_CHANGE_DOCUMENT', 'Modificar firmas o detalles del acta de cambio'),
('perm-87', 'VERIFY_SHIFT_CHANGE_DOCUMENT', 'Aplicar firma o validación legal al intercambio'),
('perm-88', 'DELETE_SHIFT_CHANGE_DOCUMENT', 'Anular el acta formal de cambio de turno'),

-- Catálogo de Turnos Base (Shifts)
('perm-89', 'CREATE_SHIFT', 'Crear una nueva plantilla de turno (ej. Mañana 8h, Noche 12h)'),
('perm-90', 'VIEW_SHIFTS', 'Ver el catálogo maestro de tipos de turnos'),
('perm-91', 'VIEW_SHIFT', 'Ver detalles de horas y reglas de un turno específico'),
('perm-92', 'UPDATE_SHIFT', 'Modificar duración, horas o color de un turno base'),
('perm-93', 'DELETE_SHIFT', 'Desactivar o eliminar un turno del catálogo maestro'),

-- Ciclo de Vida de Vacaciones
('perm-94', 'CREATE_VACATION', 'Registrar una solicitud de bloque vacacional'),
('perm-95', 'VIEW_VACATIONS', 'Ver todas las solicitudes de vacaciones del personal'),
('perm-96', 'VIEW_VACATION', 'Detalle y fechas de una solicitud vacacional específica'),
('perm-97', 'UPDATE_VACATION', 'Editar periodo de vacaciones solicitadas o estado'),
('perm-98', 'DELETE_VACATION', 'Cancelar o eliminar bloque de vacaciones programadas'),

-- Webhooks y Log de Eventos Externos
('perm-99', 'WRITE_WEBHOOK_LOGS', 'Registrar eventos de salida hacia integraciones externas'),
('perm-100', 'READ_WEBHOOK_LOGS', 'Leer historial de peticiones de webhooks enviados/recibidos'),
('perm-101', 'MANAGE_WEBHOOKS', 'Configurar URLs y secret keys de sistemas externos'),

-- Métricas Analíticas y Carga de Trabajo
('perm-102', 'CREATE_WORKLOAD_METRICS', 'Registrar puntos estadísticos de saturación de pacientes'),
('perm-103', 'VIEW_WORKLOAD_METRICS', 'Ver los índices de fatiga y saturación del personal'),
('perm-104', 'VIEW_CLINICAL_ANALYTICS', 'Acceder a dashboards ejecutivos de cobertura clínica'),
('perm-105', 'UPDATE_WORKLOAD_METRICS', 'Calibrar umbrales o corregir datos de carga laboral');

INSERT INTO "role_permissions" ("roleId", "permisionId") VALUES
('role-01', 'perm-01'), ('role-01', 'perm-02'), ('role-01', 'perm-03'), ('role-01', 'perm-04'), ('role-01', 'perm-05'),
('role-02', 'perm-08'), ('role-02', 'perm-04'), 
('role-06', 'perm-01'), ('role-06', 'perm-02'), ('role-06', 'perm-08');

INSERT INTO "monthly_distribution_rules" ("id", "organizationId", "departmentId", "type", "configuration") VALUES
('mdr-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-01', 'BALANCE_NIGHTS', '{"max_variance": 2}'),
('mdr-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-01', 'BALANCE_WEEKENDS', '{"max_weekends_per_month": 2}'),
('mdr-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-02', 'LIMIT_OVERTIME', '{"max_overtime_hours": 20}'),
('mdr-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-02', 'ROTATE_HOLIDAYS', '{"mandatory_rotation": true}'),
('mdr-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-03', 'FAIRNESS_PRIORITY', '{"weight": 0.8}'),
('mdr-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-04', 'BALANCE_NIGHTS', '{"max_variance": 1}'),
('mdr-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-05', 'DISTRIBUTE_NEW_STAFF', '{"pair_with_senior": true}'),
('mdr-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-06', 'ICU_ROTATION', '{"max_consecutive_months": 3}'),
('mdr-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-07', 'LIMIT_OVERTIME', '{"max_overtime_hours": 10}'),
('mdr-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'dept-08', 'BALANCE_WEEKENDS', '{"max_weekends_per_month": 3}');

INSERT INTO "rule_groups" ("id", "organizationId", "name", "code", "description", "isActive") VALUES
('rg-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Reglas Legales Base', 'RG-LEGAL', 'Límites de ley laboral dominicana', true),
('rg-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Fatiga y Descanso', 'RG-FATIGUE', 'Reglas de protección al empleado', true),
('rg-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Cobertura UCI', 'RG-ICU', 'Reglas estrictas para intensivos', true),
('rg-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Equidad Fines de Semana', 'RG-WEEKEND', 'Balanceo de turnos difíciles', true),
('rg-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Reglas de Maternidad', 'RG-MAT', 'Protección a embarazadas', true),
('rg-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Control de Horas Extras', 'RG-OVERTIME', 'Presupuesto y salud', true),
('rg-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Reglas de Novatos', 'RG-JUNIOR', 'Supervisión requerida', true),
('rg-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Cobertura Emergencias', 'RG-ER', 'Alta disponibilidad ER', true),
('rg-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Restricciones Quirófano', 'RG-SURG', 'Certificaciones requeridas', true),
('rg-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'Reglas de Fin de Año', 'RG-HOLIDAY', 'Distribución de feriados', true);

INSERT INTO "work_rules" ("id", "organizationId", "code", "name", "value") VALUES
('wr-01', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'WR-MAX-HRS', 'Max Horas Mensuales', '160'),
('wr-02', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'WR-MIN-REST', 'Descanso Mínimo (Horas)', '12'),
('wr-03', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'WR-MAX-CONSEC', 'Max Días Consecutivos', '6'),
('wr-04', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'WR-MAX-NIGHTS', 'Max Noches Consecutivas', '3'),
('wr-05', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'WR-REQ-SENIOR', 'Requiere Senior en Turno', 'true'),
('wr-06', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'WR-MAX-WEEKEND', 'Max Fines de Semana/Mes', '2'),
('wr-07', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'WR-DOUBLE-SHIFT', 'Permitir Doble Turno', 'false'),
('wr-08', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'WR-PREG-NIGHTS', 'Embarazadas en Noche', 'false'),
('wr-09', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'WR-OVERTIME-CAP', 'Límite Horas Extras', '20'),
('wr-10', 'e3772e1f-17b5-47e6-b0c5-077d0432f7ca', 'WR-MIN-STAFF', 'Personal Mínimo Absoluto', '2');

INSERT INTO "work_rule_conditions" ("id", "workRuleId", "condition_type", "operator", "value") VALUES
('wrc-01', 'wr-01', 'TOTAL_HOURS', 'GREATER_THAN', '160'),
('wrc-02', 'wr-02', 'REST_HOURS', 'LESS_THAN', '12'),
('wrc-03', 'wr-03', 'CONSECUTIVE_DAYS', 'GREATER_THAN', '6'),
('wrc-04', 'wr-04', 'CONSECUTIVE_NIGHTS', 'GREATER_THAN', '3'),
('wrc-05', 'wr-05', 'SENIOR_COUNT', 'EQUALS', '0'),
('wrc-06', 'wr-06', 'WEEKENDS_WORKED', 'GREATER_THAN', '2'),
('wrc-07', 'wr-07', 'SHIFT_DURATION', 'GREATER_THAN', '12'),
('wrc-08', 'wr-08', 'IS_PREGNANT', 'EQUALS', 'true'),
('wrc-09', 'wr-09', 'OVERTIME_HOURS', 'GREATER_THAN', '20'),
('wrc-10', 'wr-10', 'STAFF_COUNT', 'LESS_THAN', '2');

INSERT INTO "work_rule_actions" ("id", "workRuleId", "action_type", "action_value") VALUES
('wra-01', 'wr-01', 'BLOCK_ASSIGNMENT', 'true'),
('wra-02', 'wr-02', 'BLOCK_ASSIGNMENT', 'true'),
('wra-03', 'wr-03', 'FLAG_WARNING', 'Fatiga alta'),
('wra-04', 'wr-04', 'BLOCK_ASSIGNMENT', 'true'),
('wra-05', 'wr-05', 'NOTIFY_SUPERVISOR', 'Falta Senior'),
('wra-06', 'wr-06', 'REDUCE_SCORE', '-50'),
('wra-07', 'wr-07', 'BLOCK_ASSIGNMENT', 'true'),
('wra-08', 'wr-08', 'BLOCK_ASSIGNMENT', 'true'),
('wra-09', 'wr-09', 'REQUIRE_APPROVAL', 'true'),
('wra-10', 'wr-10', 'TRIGGER_ALERT', 'CRITICAL');

INSERT INTO "rule_group_assignments" ("id", "workRuleId", "ruleGroupId") VALUES
('rga-01', 'wr-01', 'rg-01'),
('rga-02', 'wr-02', 'rg-02'),
('rga-03', 'wr-03', 'rg-02'),
('rga-04', 'wr-04', 'rg-02'),
('rga-05', 'wr-05', 'rg-07'),
('rga-06', 'wr-06', 'rg-04'),
('rga-07', 'wr-07', 'rg-02'),
('rga-08', 'wr-08', 'rg-05'),
('rga-09', 'wr-09', 'rg-06'),
('rga-10', 'wr-10', 'rg-01');