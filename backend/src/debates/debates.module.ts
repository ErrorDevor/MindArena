import { Module } from "@nestjs/common";

import { AgentModule } from "../agent/agent.module";
import { DebatesController } from "./debates.controller";
import { DebatesService } from "./debates.service";

@Module({
   imports: [AgentModule],
   controllers: [DebatesController],
   providers: [DebatesService],
})
export class DebatesModule {}
