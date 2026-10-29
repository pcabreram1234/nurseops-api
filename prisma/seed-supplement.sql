-- =====================================================================
-- Seed complementario: datos de muestra para
--   1) workload_metrics  (Carga de Trabajo y Fatiga)
--   2) integrations      (Integraciones API)
--
-- Idempotente: usa IDs deterministas + ON CONFLICT DO NOTHING.
-- Los valores son MUESTRAS coherentes con la plantilla demo del sistema
-- (no son métricas reales de producción).
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. WORKLOAD METRICS  (8 enfermeras × meses Sep/Oct 2026)
-- ---------------------------------------------------------------------
INSERT INTO "workload_metrics"
  ("id","organizationId","nurseId","total_hours","overtime_hours","month","year",
   "regular_hours","nigth_hours","weekend_hours","holidy_hours","emergency_hours",
   "fatigue_score","fairness_score","workload_score","burnout_risk")
VALUES
  -- ===== Septiembre 2026 =====
  ('wl-nurse01-202609','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-01',176, 8, 9,2026,168, 32, 32, 0, 4, 42, 88, 55, 0.35),
  ('wl-nurse02-202609','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-02',192,24, 9,2026,168, 56, 48, 0, 6, 68, 72, 74, 0.58),
  ('wl-nurse04-202609','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-04',160, 0, 9,2026,160, 16, 16, 0, 0, 24, 95, 38, 0.15),
  ('wl-nurse07-202609','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-07',204,40, 9,2026,164, 72, 48, 0, 8, 84, 58, 91, 0.78),
  ('wl-nurse13-202609','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-13',168, 4, 9,2026,164, 24, 32, 0, 2, 36, 90, 50, 0.28),
  ('wl-nurse15-202609','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-15',184,16, 9,2026,168, 40, 32, 8, 4, 57, 79, 65, 0.46),
  ('wl-nurse19-202609','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-19',198,32, 9,2026,166, 64, 48, 0, 8, 76, 64, 83, 0.71),
  ('wl-nurse20-202609','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-20',160, 0, 9,2026,160,  8, 16, 0, 0, 18, 97, 32, 0.12),

  -- ===== Octubre 2026 =====
  ('wl-nurse01-202610','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-01',184,16,10,2026,168, 40, 32, 0, 4, 51, 84, 62, 0.41),
  ('wl-nurse02-202610','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-02',200,32,10,2026,168, 64, 48, 0, 6, 74, 66, 80, 0.64),
  ('wl-nurse04-202610','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-04',168, 8,10,2026,160, 24, 24, 0, 0, 31, 92, 44, 0.22),
  ('wl-nurse07-202610','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-07',212,48,10,2026,164, 80, 48, 0,10, 91, 49, 96, 0.85),
  ('wl-nurse13-202610','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-13',176,12,10,2026,164, 32, 32, 0, 2, 44, 86, 56, 0.33),
  ('wl-nurse15-202610','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-15',188,20,10,2026,168, 48, 32, 0, 4, 63, 75, 69, 0.51),
  ('wl-nurse19-202610','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-19',204,36,10,2026,168, 68, 48, 0, 8, 81, 60, 87, 0.74),
  ('wl-nurse20-202610','e3772e1f-17b5-47e6-b0c5-077d0432f7ca','nurse-20',164, 4,10,2026,160, 16, 16, 0, 0, 22, 96, 36, 0.14)
ON CONFLICT ("id") DO NOTHING;

-- ---------------------------------------------------------------------
-- 2. INTEGRATIONS (3 integraciones de ejemplo, sin credenciales reales)
-- ---------------------------------------------------------------------
INSERT INTO "integrations"
  ("id","organizationId","provider","configuration","name","isActive")
VALUES
  ('int-smtp-01',
   'e3772e1f-17b5-47e6-b0c5-077d0432f7ca',
   'SMTP',
   '{"host":"smtp.ejemplo-hospital.local","port":587,"secure":false,"user":"notificaciones@hospital.local","from":"NurseOps <notificaciones@hospital.local>"}'::jsonb,
   'Servidor SMTP de notificaciones',
   true),
  ('int-firebase-01',
   'e3772e1f-17b5-47e6-b0c5-077d0432f7ca',
   'FIREBASE',
   '{"projectId":"hospital-notificaciones-demo","messagingSenderId":"000000000000","note":"Credenciales reales se cargan en el servidor"}'::jsonb,
   'Firebase Cloud Messaging (Push)',
   true),
  ('int-gcal-01',
   'e3772e1f-17b5-47e6-b0c5-077d0432f7ca',
   'GOOGLE_CALENDAR',
   '{"calendarId":"turnos.enfermeria@hospital.local","timezone":"America/Santo_Domingo","scope":"calendar.events.readonly"}'::jsonb,
   'Sincronización con Google Calendar',
   false)
ON CONFLICT ("id") DO NOTHING;

COMMIT;
