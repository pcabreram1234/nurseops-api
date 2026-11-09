-- ============================================================================
-- Insertar permisos faltantes para el módulo de Intercambio de Turnos
-- ============================================================================

INSERT INTO "permissions" ("id", "name", "description") VALUES
('perm-shift-change-create-request', 'CREATE_SHIFT_CHANGE_REQUEST', 'Crear solicitud de intercambio, cesión o cobertura de turno'),
('perm-shift-change-read-request', 'READ_SHIFT_CHANGE_REQUEST', 'Leer solicitudes propias de intercambio de turnos'),
('perm-shift-change-read-received', 'READ_SHIFT_CHANGE_RECEIVED', 'Leer solicitudes recibidas de intercambio de turnos'),
('perm-shift-change-read-opportunities', 'READ_SHIFT_CHANGE_OPPORTUNITIES', 'Leer oportunidades de cobertura publicadas'),
('perm-shift-change-read-stats', 'READ_SHIFT_CHANGE_STATS', 'Ver estadísticas de solicitudes de intercambio'),
('perm-shift-change-read-detail', 'READ_SHIFT_CHANGE_DETAIL', 'Ver detalle completo de una solicitud de intercambio'),
('perm-shift-change-update-request', 'UPDATE_SHIFT_CHANGE_REQUEST', 'Actualizar solicitud de intercambio pendiente'),
('perm-shift-change-respond-request', 'RESPOND_SHIFT_CHANGE_REQUEST', 'Aceptar o rechazar invitación de intercambio de turnos'),
('perm-shift-change-apply-request', 'APPLY_SHIFT_CHANGE_REQUEST', 'Aplicar cambio de turno aprobado por supervisión'),
('perm-shift-change-approve-request', 'APPROVE_SHIFT_CHANGE_REQUEST', 'Aprobar solicitud de intercambio por supervisión'),
('perm-shift-change-reject-request', 'REJECT_SHIFT_CHANGE_REQUEST', 'Rechazar solicitud de intercambio por supervisión'),
('perm-shift-change-cancel-request', 'CANCEL_SHIFT_CHANGE_REQUEST', 'Cancelar solicitud de intercambio de turnos'),
('perm-coverage-apply-request', 'APPLY_COVERAGE_REQUEST', 'Postularse a una oportunidad de cobertura de turno'),
('perm-coverage-select-candidate', 'SELECT_COVERAGE_CANDIDATE', 'Seleccionar candidata para una cobertura de turno'),
('perm-coverage-withdraw-application', 'WITHDRAW_COVERAGE_APPLICATION', 'Retirar postulación a una cobertura de turno'),
('perm-shift-change-policy-create', 'CREATE_SHIFT_CHANGE_POLICY', 'Crear política de intercambio de turnos'),
('perm-shift-change-policy-read', 'READ_SHIFT_CHANGE_POLICY', 'Leer políticas de intercambio de turnos'),
('perm-shift-change-policy-update', 'UPDATE_SHIFT_CHANGE_POLICY', 'Actualizar política de intercambio de turnos'),
('perm-shift-change-policy-delete', 'DELETE_SHIFT_CHANGE_POLICY', 'Eliminar política de intercambio de turnos')
ON CONFLICT ("name") DO NOTHING;

-- ============================================================================
-- Asignar permisos a NURSE_SENIOR (role-02)
-- ============================================================================
INSERT INTO "role_permissions" ("roleId", "permisionId") VALUES
('role-02', 'perm-shift-change-create-request'),
('role-02', 'perm-shift-change-read-request'),
('role-02', 'perm-shift-change-read-received'),
('role-02', 'perm-shift-change-read-opportunities'),
('role-02', 'perm-shift-change-read-stats'),
('role-02', 'perm-shift-change-read-detail'),
('role-02', 'perm-shift-change-cancel-request'),
('role-02', 'perm-coverage-apply-request'),
('role-02', 'perm-coverage-withdraw-application'),
('role-02', 'perm-create-shift-change-document'),
('role-02', 'perm-view-all-shift-change-document'),
('role-02', 'perm-view-shift-change-document'),
('role-02', 'perm-update-shift-change-document'),
('role-02', 'perm-delete-shift-change-document')
ON CONFLICT ("roleId", "permisionId") DO NOTHING;

-- ============================================================================
-- Asignar permisos a NURSE_JUNIOR (role-03)
-- ============================================================================
INSERT INTO "role_permissions" ("roleId", "permisionId") VALUES
('role-03', 'perm-shift-change-read-request'),
('role-03', 'perm-shift-change-read-received'),
('role-03', 'perm-shift-change-read-opportunities'),
('role-03', 'perm-shift-change-read-stats'),
('role-03', 'perm-shift-change-read-detail'),
('role-03', 'perm-shift-change-cancel-request'),
('role-03', 'perm-coverage-apply-request'),
('role-03', 'perm-coverage-withdraw-application'),
('role-03', 'perm-create-shift-change-document'),
('role-03', 'perm-view-shift-change-document'),
('role-03', 'perm-update-shift-change-document'),
('role-03', 'perm-delete-shift-change-document')
ON CONFLICT ("roleId", "permisionId") DO NOTHING;

-- ============================================================================
-- Asignar permisos a DEPARTMENT_HEAD (role-06)
-- ============================================================================
INSERT INTO "role_permissions" ("roleId", "permisionId") VALUES
('role-06', 'perm-shift-change-read-request'),
('role-06', 'perm-shift-change-read-received'),
('role-06', 'perm-shift-change-read-opportunities'),
('role-06', 'perm-shift-change-read-stats'),
('role-06', 'perm-shift-change-read-detail'),
('role-06', 'perm-shift-change-cancel-request'),
('role-06', 'perm-coverage-select-candidate'),
('role-06', 'perm-create-shift-change-document'),
('role-06', 'perm-view-all-shift-change-document'),
('role-06', 'perm-view-shift-change-document'),
('role-06', 'perm-update-shift-change-document'),
('role-06', 'perm-delete-shift-change-document')
ON CONFLICT ("roleId", "permisionId") DO NOTHING;

-- ============================================================================
-- Asignar permisos a TEMP_NURSE (role-08)
-- ============================================================================
INSERT INTO "role_permissions" ("roleId", "permisionId") VALUES
('role-08', 'perm-shift-change-read-request'),
('role-08', 'perm-shift-change-read-received'),
('role-08', 'perm-shift-change-read-opportunities'),
('role-08', 'perm-shift-change-read-stats'),
('role-08', 'perm-shift-change-read-detail'),
('role-08', 'perm-shift-change-cancel-request'),
('role-08', 'perm-coverage-apply-request'),
('role-08', 'perm-coverage-withdraw-application')
ON CONFLICT ("roleId", "permisionId") DO NOTHING;

-- ============================================================================
-- Asignar permisos a HR_MANAGER (role-04)
-- ============================================================================
INSERT INTO "role_permissions" ("roleId", "permisionId") VALUES
('role-04', 'perm-shift-change-read-request'),
('role-04', 'perm-shift-change-read-received'),
('role-04', 'perm-shift-change-read-opportunities'),
('role-04', 'perm-shift-change-read-stats'),
('role-04', 'perm-shift-change-read-detail'),
('role-04', 'perm-shift-change-policy-read'),
('role-04', 'perm-verify-shift-change-document'),
('role-04', 'perm-view-shift-change-document')
ON CONFLICT ("roleId", "permisionId") DO NOTHING;

-- ============================================================================
-- Asignar permisos a NIGHT_SUPERVISOR (role-07)
-- ============================================================================
INSERT INTO "role_permissions" ("roleId", "permisionId") VALUES
('role-07', 'perm-shift-change-read-request'),
('role-07', 'perm-shift-change-read-received'),
('role-07', 'perm-shift-change-read-opportunities'),
('role-07', 'perm-shift-change-read-stats'),
('role-07', 'perm-shift-change-read-detail'),
('role-07', 'perm-shift-change-cancel-request'),
('role-07', 'perm-shift-change-apply-request'),
('role-07', 'perm-coverage-select-candidate'),
('role-07', 'perm-create-shift-change-document'),
('role-07', 'perm-view-all-shift-change-document'),
('role-07', 'perm-view-shift-change-document'),
('role-07', 'perm-update-shift-change-document')
ON CONFLICT ("roleId", "permisionId") DO NOTHING;

-- ============================================================================
-- Asignar permisos a AUDITOR (role-09)
-- ============================================================================
INSERT INTO "role_permissions" ("roleId", "permisionId") VALUES
('role-09', 'perm-shift-change-read-request'),
('role-09', 'perm-shift-change-read-received'),
('role-09', 'perm-shift-change-read-opportunities'),
('role-09', 'perm-shift-change-read-stats'),
('role-09', 'perm-shift-change-read-detail'),
('role-09', 'perm-shift-change-policy-read'),
('role-09', 'perm-view-all-shift-change-document'),
('role-09', 'perm-view-shift-change-document'),
('role-09', 'perm-read-audit-logs')
ON CONFLICT ("roleId", "permisionId") DO NOTHING;

-- ============================================================================
-- Asignar permisos a READ_ONLY_VIEWER (role-10)
-- ============================================================================
INSERT INTO "role_permissions" ("roleId", "permisionId") VALUES
('role-10', 'perm-shift-change-read-request'),
('role-10', 'perm-shift-change-read-received'),
('role-10', 'perm-shift-change-read-opportunities'),
('role-10', 'perm-shift-change-read-stats'),
('role-10', 'perm-shift-change-read-detail'),
('role-10', 'perm-shift-change-policy-read'),
('role-10', 'perm-view-all-shift-change-document'),
('role-10', 'perm-view-shift-change-document')
ON CONFLICT ("roleId", "permisionId") DO NOTHING;

-- ============================================================================
-- Asignar permisos a SYSTEM_ADMIN (role-05) - Todos los permisos del módulo
-- ============================================================================
INSERT INTO "role_permissions" ("roleId", "permisionId") VALUES
('role-05', 'perm-shift-change-create-request'),
('role-05', 'perm-shift-change-read-request'),
('role-05', 'perm-shift-change-read-received'),
('role-05', 'perm-shift-change-read-opportunities'),
('role-05', 'perm-shift-change-read-stats'),
('role-05', 'perm-shift-change-read-detail'),
('role-05', 'perm-shift-change-update-request'),
('role-05', 'perm-shift-change-respond-request'),
('role-05', 'perm-shift-change-apply-request'),
('role-05', 'perm-shift-change-approve-request'),
('role-05', 'perm-shift-change-reject-request'),
('role-05', 'perm-shift-change-cancel-request'),
('role-05', 'perm-coverage-apply-request'),
('role-05', 'perm-coverage-select-candidate'),
('role-05', 'perm-coverage-withdraw-application'),
('role-05', 'perm-shift-change-policy-create'),
('role-05', 'perm-shift-change-policy-read'),
('role-05', 'perm-shift-change-policy-update'),
('role-05', 'perm-shift-change-policy-delete'),
('role-05', 'perm-create-shift-change-document'),
('role-05', 'perm-view-all-shift-change-document'),
('role-05', 'perm-view-shift-change-document'),
('role-05', 'perm-update-shift-change-document'),
('role-05', 'perm-verify-shift-change-document'),
('role-05', 'perm-delete-shift-change-document')
ON CONFLICT ("roleId", "permisionId") DO NOTHING;
