import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { ResponseInterceptor } from "@common/interceptors/response.interceptor";
import { AuditInterceptor } from "@common/interceptors/audit.interceptor";
import { PrismaService } from "@infra/database/prisma.service";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /*
  |--------------------------------------------------------------------------
  | Security
  |--------------------------------------------------------------------------
  */
  app.use(helmet());

  /*
  |--------------------------------------------------------------------------
  | CORS
  |--------------------------------------------------------------------------
  */
  app.enableCors({
    origin: "*",
    credentials: true,
  });

  /*
  |--------------------------------------------------------------------------
  | Global Prefix
  |--------------------------------------------------------------------------
  */
  app.setGlobalPrefix("api");

  /*
  |--------------------------------------------------------------------------
  | API Versioning
  |--------------------------------------------------------------------------
  */
  app.enableVersioning({
    type: VersioningType.URI,
  });

  /*
  |--------------------------------------------------------------------------
  | Global Validation
  |--------------------------------------------------------------------------
  */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /*
  |--------------------------------------------------------------------------
  | Response Interceptor
  |--------------------------------------------------------------------------
  */

  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalInterceptors(new AuditInterceptor(app.get(PrismaService)));

  /*
  |--------------------------------------------------------------------------
  | Swagger
  |--------------------------------------------------------------------------
  */
  const config = new DocumentBuilder()
    .setTitle("NurseOps API")
    .setDescription("Operational healthcare workforce management platform API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api/docs", app, document);

  /*
  |--------------------------------------------------------------------------
  | Start Server
  |--------------------------------------------------------------------------
  */
  await app.listen(process.env.PORT || 3000);

  console.log(
    `🚀 NurseOps API running on: http://localhost:${process.env.PORT || 3000}`,
  );

  console.log(
    `📚 Swagger Docs: http://localhost:${process.env.PORT || 3000}/api/docs`,
  );
}

bootstrap();
