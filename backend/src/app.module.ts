import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AgentModule } from "./agent/agent.module";
import { AuthModule } from "./auth/auth.module";
import { DebatesModule } from "./debates/debates.module";
import { MiscModule } from "./misc/misc.module";

@Module({
   imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      AgentModule,
      DebatesModule,
      AuthModule,
      MiscModule,
   ],
})
export class AppModule {}
