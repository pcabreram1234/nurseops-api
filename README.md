# NurseOps API

Backend core for **NurseOps**, an operational healthcare workforce management platform designed to help hospitals and healthcare organizations manage nurse scheduling, operational coverage, emergency replacements, fatigue prevention, overtime control, vacation/leave management, real-time operational alerts, and staffing optimization.

---

## Tech Stack

| Category            | Technology                                                                 |
| ------------------- | -------------------------------------------------------------------------- |
| **Runtime**         | Node.js, TypeScript 6.x                                                    |
| **Framework**       | NestJS 11.x                                                                |
| **Database**        | PostgreSQL 16                                                              |
| **ORM**             | Prisma 7.x (`@prisma/client` + `@prisma/adapter-pg`)                       |
| **Cache / Queue**   | Redis 7, BullMQ 5.x, ioredis                                               |
| **Auth**            | JWT (passport-jwt), bcrypt                                                 |
| **Validation**      | class-validator, class-transformer                                         |
| **API Docs**        | Swagger / OpenAPI (`@nestjs/swagger` + swagger-ui-express)                 |
| **Real-time**       | Socket.IO (`@nestjs/platform-socket.io` / `@nestjs/websockets`)            |
| **Events**          | `@nestjs/event-emitter`                                                    |
| **Scheduling**      | `@nestjs/schedule` (cron)                                                  |
| **Logging**         | nestjs-pino, pino, pino-pretty                                             |
| **Security**        | helmet, `@nestjs/throttler`                                                |
| **Package manager** | pnpm                                                                       |
| **Testing**         | Jest                                                                       |
| **Lint / Format**   | ESLint, Prettier                                                           |

---

## Architecture

The API follows a **modular, domain-driven** architecture with a global `/api` prefix and URI-based versioning (`/api/v1/...`). Each business domain is encapsulated in its own module with controllers, services, DTOs, and optionally its own guards, interceptors, gateways, and event listeners.

### Global infrastructure

- **Security**: Helmet middleware, CORS enabled, throttler guard
- **Validation**: Global `ValidationPipe` (whitelist + transform)
- **Response format**: Standardized `{ success, timestamp, data, meta? }` envelope via `ResponseInterceptor`
- **Error handling**: Global `ExceptionFilter` with consistent error schema
- **Audit**: Interceptor-based audit logging with EventEmitter2
- **WebSocket**: Socket.IO gateway for real-time schedule updates and alerts
- **Background jobs**: BullMQ queues for async processing (optimization, notifications)
- **Multi-tenant**: All major models carry `organizationId` for data isolation

### Modules (50+)

| Module                | Purpose                                                    |
| --------------------- | ---------------------------------------------------------- |
| **Auth**              | Registration, login, JWT + refresh tokens, RBAC            |
| **Users**             | User CRUD and profile management                           |
| **Nurses**            | Nurse employment data (contract, status, specialty)        |
| **NurseProfiles**     | Clinical profiles, certifications, languages, contacts     |
| **NursePreferences**  | Shift preferences (preferred shift, max nights, weekends)  |
| **NurseRestrictions** | Work restrictions (no nights, no overtime, medical, etc.)  |
| **NurseAvailability** | Daily availability tracking                                |
| **Schedules**         | Core scheduling engine (DRAFT → GENERATING → APPROVED → PUBLISHED) |
| **ScheduleVersions**  | Version history with JSON snapshots                        |
| **ScheduleEntries**   | Individual nurse-shift assignments                         |
| **Shifts**            | Shift definitions (MORNING, AFTERNOON, NIGHT, ON_CALL, etc.) |
| **ShiftTemplates**    | Reusable shift patterns with staffing requirements         |
| **Coverage**          | Coverage management and cross-department support           |
| **EmergencyCoverages**| Emergency shift coverage workflows                         |
| **EmergencyCandidates**| Candidate matching for emergency shifts                   |
| **Vacations**         | Vacation requests (DRAFT → PENDING → APPROVED → COMPLETED) |
| **Leaves**            | Leave management (medical, personal, study, bereavement)   |
| **Absences**          | Unplanned absences                                         |
| **ShiftChangeRequests**| Swap/change requests between nurses                       |
| **ShiftChangeApprovals**| Multi-level approval workflow                             |
| **ShiftChangeDocuments**| Supporting documentation for shift changes                |
| **WorkRules**         | Configurable business rules engine                         |
| **WorkRuleConditions**| Rule condition definitions                                 |
| **WorkRuleActions**   | Rule action definitions                                    |
| **RuleGroups**        | Grouping and assigning rules                               |
| **MonthlyDistributionRules** | Distribution policies (nights, weekends, overtime, holidays, fairness) |
| **Optimization**      | Optimization engine management                             |
| **OptimizationRuns**  | Engine execution tracking                                  |
| **OptimizationScores**| Nurse-level optimization metrics                           |
| **WorkloadMetrics**   | Clinical workload tracking (fatigue, burnout, fairness)    |
| **OperationalAlerts** | Real-time alerts (shortage, overtime risk, fatigue risk)   |
| **Notifications**     | User notifications with priority levels                    |
| **NotificationTypes** | Notification categories (50+)                              |
| **NotificationTemplates** | Multi-channel templates (email, SMS, push, WhatsApp, in-app) |
| **Organizations**     | Multi-tenant organization management                       |
| **OrganizationSettings**| Tenant-level configuration                               |
| **Branches**          | Physical locations / hospitals                             |
| **Departments**       | Clinical departments (ICU, ER, PEDIATRICS, SURGERY, etc.)  |
| **DepartmentConfigurations** | Department-specific settings                       |
| **DepartmentSpecialities** | Required specialties per department                   |
| **Specialities**      | Specialty catalog                                          |
| **Roles**             | Role management                                            |
| **Permissions**       | Granular permission definitions                            |
| **Modules**           | System module registry                                     |
| **FeatureFlags**      | Feature toggles (10 flags)                                 |
| **Integrations**      | External system integrations (Twilio, WhatsApp, Google Calendar, SAP) |
| **WebhookLogs**       | Webhook delivery logs                                      |
| **ActivityLogs**      | User activity tracking                                     |
| **AuditLog**          | Detailed audit trail (IP, user-agent, request ID)          |
| **Analytics**         | Business analytics endpoints                               |

---

## Prerequisites

- **Node.js** >= 20
- **pnpm** (recommended) or npm
- **Docker** (for PostgreSQL and Redis)
- **PostgreSQL** 16
- **Redis** 7

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/nurseops-api.git
cd nurseops-api
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start infrastructure (PostgreSQL + Redis)

```bash
docker-compose up -d
```

### 4. Configure environment

Copy `.env` and adjust values if needed:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nurseops?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
SYSTEM_BOT_USER_ID="00000000-0000-0000-0000-000000000000"
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Seed the database (optional)

```bash
npx tsx prisma/seed.ts
```

Or with raw SQL:

```bash
psql -U postgres -d nurseops -f prisma/DummyData.sql
```

### 7. Start the development server

```bash
pnpm run start:dev
```

The API will be available at `http://localhost:3000/api/v1/`.

Swagger documentation: `http://localhost:3000/api/docs`.

---

## Scripts

| Command               | Description                            |
| --------------------- | -------------------------------------- |
| `pnpm run start:dev`  | Start with hot-reload (`nest start --watch`) |
| `pnpm run start:debug`| Start in debug mode                    |
| `pnpm run build`      | Compile to `dist/`                     |
| `pnpm run start:prod` | Run compiled production build          |
| `pnpm run test`       | Run Jest tests                         |
| `pnpm run test:watch` | Run tests in watch mode                |
| `pnpm run lint`       | Lint and auto-fix with ESLint          |
| `pnpm run format`     | Format code with Prettier              |

---

## Database

The Prisma schema defines **40+ models** covering the entire healthcare workforce management domain. Key entities:

- **Organization** → Branch → Department → Nurse (multi-tenant hierarchy)
- **Schedule** → ScheduleVersion → ScheduleEntry (monthly scheduling)
- **Shift** → ShiftTemplate → ScheduleEntry (shift definitions)
- **WorkRule** → WorkRuleConditions → WorkRuleActions (rules engine)
- **Notification** → NotificationType → NotificationTemplate (multi-channel)
- **Role** ↔ **Permission** (RBAC)

Migrations are located in `prisma/migrations/`.

Generate the Prisma client after schema changes:

```bash
npx prisma generate
```

---

## API Documentation

Interactive Swagger UI is available at `/api/docs` when the server is running.

The API uses:
- **Global prefix**: `/api`
- **Versioning**: URI-based (`/api/v1/...`)
- **Auth**: Bearer JWT tokens
- **Standard response**: `{ success: boolean, timestamp: string, data: T, meta?: object }`

---

## Project Structure

```
nurseops-api/
├── prisma/                  # Schema, migrations, seeds
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Root module
│   ├── config/              # Configuration modules
│   ├── common/              # Shared (interceptors, filters, guards, decorators, pipes)
│   ├── infrastructure/      # Database, Redis, queues, mail, WebSocket
│   ├── events/              # Event definitions
│   ├── interfaces/          # Shared interfaces
│   ├── types/               # Shared types
│   ├── jobs/                # BullMQ job processors
│   └── modules/             # Domain feature modules
├── docker-compose.yml       # PostgreSQL + Redis
├── tsconfig.json            # TypeScript configuration
├── nest-cli.json            # NestJS CLI configuration
└── package.json
```

---

## Testing

```bash
# Run all tests
pnpm run test

# Watch mode
pnpm run test:watch
```

---

## Linting & Formatting

```bash
pnpm run lint      # ESLint with auto-fix
pnpm run format    # Prettier
```

---

## Long-Term Vision

NurseOps aims to become an intelligent operational platform for healthcare workforce management focused on:

- Operational efficiency
- Workload balance
- Staffing intelligence
- Fatigue reduction
- Real-time hospital operations

---

## Related Repositories

| Repository        | Description        |
| ----------------- | ------------------ |
| nurseops-api      | Backend (this repo)|
| nurseops-web      | Frontend web app   |
| nurseops-mobile   | Mobile application |

---

## License

Private
