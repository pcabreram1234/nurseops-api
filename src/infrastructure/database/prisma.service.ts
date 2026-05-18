import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

// 1. Importamos PrismaClient desde tu ruta generada personalizada para Prisma 7
import { PrismaClient } from '@prisma/client';

// 2. Importamos el Driver nativo de Postgres y el adaptador de Prisma 7
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // 3. Creamos el pool de conexiones nativo usando tu variable de entorno
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // 4. Instanciamos el adaptador de controladores de Prisma 7
    const adapter = new PrismaPg(pool);

    // 5. Pasamos el adaptador al constructor base (Requisito mandatorio de Prisma 7)
    super({ adapter });
  }

  async onModuleInit() {
    try {
      // Establece la comunicación inicial a través del adaptador
      await this.$connect();
      this.logger.log('✅ Prisma connected successfully via Driver Adapter (v7)');
    } catch (error) {
      this.logger.error('❌ Prisma failed to connect to the database', error);
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}