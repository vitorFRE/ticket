import { type INestApplication, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const SWAGGER_PATH = "docs";

function isSwaggerEnabled(): boolean {
  if (process.env.SWAGGER_ENABLED === "true") return true;
  if (process.env.SWAGGER_ENABLED === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function setupSwagger(app: INestApplication): void {
  if (!isSwaggerEnabled()) return;

  const config = new DocumentBuilder()
    .setTitle("Ticket API")
    .setDescription("API do sistema de tickets")
    .setVersion("0.0.1")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "bearer",
    )
    .addSecurityRequirements("bearer")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document);

  new Logger("Swagger").log(`OpenAPI disponível em /${SWAGGER_PATH}`);
}
