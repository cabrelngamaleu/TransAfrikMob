import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sécurité
  app.use(helmet);
  app.enableCors();

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle("CrossPay Africa API")
    .setDescription(
      "API pour les paiements mobiles transfrontaliers en Afrique"
    )
    .setVersion("1.0")
    .addTag("auth")
    .addTag("recipients")
    .addTag("payments")
    .addTag("webhooks")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}
bootstrap();
