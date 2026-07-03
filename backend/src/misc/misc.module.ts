import { Module } from "@nestjs/common";

import { AgentModule } from "../agent/agent.module";
import { MiscController } from "./misc.controller";

@Module({
   imports: [AgentModule],
   controllers: [MiscController],
})
export class MiscModule {}
