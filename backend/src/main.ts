import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";

import { AppModule } from "./app.module";

async function bootstrap() {
   const app = await NestFactory.create(AppModule);
   const configService = app.get(ConfigService);

   app.enableCors();
   app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true })
   );

   const port = configService.get<number>("PORT", 3002);
   const agentUrl = configService.get<string>("AGENT_SYSTEM_URL", "http://127.0.0.1:8000");

   await app.listen(port);
   console.log(`mindarena-backend on http://localhost:${port} → agent ${agentUrl}`);
}

bootstrap();
