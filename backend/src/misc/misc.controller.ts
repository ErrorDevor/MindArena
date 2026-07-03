import { Controller, Get } from "@nestjs/common";

import { AgentSystemService } from "../agent/agent-system.service";

@Controller()
export class MiscController {
   constructor(private readonly agent: AgentSystemService) {}

   @Get("health")
   health() {
      return this.agent.health();
   }

   @Get("roles")
   roles() {
      return this.agent.roles();
   }
}
