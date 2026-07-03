import { Module } from "@nestjs/common";

import { AgentSystemService } from "./agent-system.service";

@Module({
   providers: [AgentSystemService],
   exports: [AgentSystemService],
})
export class AgentModule {}
