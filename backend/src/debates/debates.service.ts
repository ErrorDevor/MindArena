import { Injectable, MessageEvent, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Observable } from "rxjs";

import { AgentSystemService } from "../agent/agent-system.service";
import { CreateDebateDto } from "./dto/create-debate.dto";
import { DetectDto } from "./dto/detect.dto";
import { IntakeDto } from "./dto/intake.dto";

const EMPTY_FINAL = {
   opportunityScore: 0,
   childQuestions: [],
   researchGaps: [],
   crossDomainHypotheses: [],
   profitPatterns: [],
   fundingBranches: [],
};

@Injectable()
export class DebatesService {
   constructor(private readonly agent: AgentSystemService) {}

   async create(dto: CreateDebateDto) {
      const debateId = dto.debateId ?? randomUUID();

      const data = await this.agent.start({
         thesis: dto.thesis.trim(),
         mode: dto.mode ?? "CONVERGENT",
         strategy: dto.strategy ?? "",
         maxRounds: dto.maxRounds ?? 3,
         models: dto.models ?? ["GPT", "CLAUDE", "GEMINI", "GLM"],
         debateId,
      });

      return {
         debateId,
         strategy: data.strategy,
         models: data.models,
         roster: data.roster,
      };
   }

   detect(dto: DetectDto) {
      return this.agent.detect(dto);
   }

   intake(dto: IntakeDto) {
      return this.agent.intake(dto);
   }

   pingStart() {
      return this.agent.pingStart();
   }

   pingStatus(checkId: string) {
      return this.agent.pingStatus(checkId);
   }

   async getOne(debateId: string) {
      for (let attempt = 0; attempt < 10; attempt++) {
         const data = await this.agent.fetchEvents(debateId, 0);
         if (data === null) throw new NotFoundException("unknown debate");

         const hasStarted = data.events.some((e) => e.event === "debate.started");
         if (hasStarted || data.done) {
            return this.agent.buildDebateObject(debateId, data.events);
         }
         await new Promise((r) => setTimeout(r, 300));
      }
      return this.agent.buildDebateObject(debateId, []);
   }

   async getFinal(debateId: string) {
      const data = await this.agent.fetchEvents(debateId, 0);
      if (data === null) throw new NotFoundException("unknown debate");

      const completed = data.events.find((e) => e.event === "debate.completed");
      return (completed?.data?.final as Record<string, unknown>) ?? EMPTY_FINAL;
   }

   stream(debateId: string): Observable<MessageEvent> {
      return new Observable<MessageEvent>((subscriber) => {
         let cancelled = false;

         const run = async () => {
            let since = 0;
            try {
               while (!cancelled) {
                  const data = await this.agent.fetchEvents(debateId, since);

                  if (data === null) {
                     subscriber.next({
                        type: "debate.failed",
                        data: { debateId, reason: "unknown or expired debate" },
                     });
                     break;
                  }

                  for (const e of data.events) {
                     subscriber.next({ type: e.event, data: e.data });
                  }
                  since = data.nextIndex;

                  if (data.done) break;
                  await new Promise((r) => setTimeout(r, 700));
               }
            } catch (err) {
               subscriber.next({
                  type: "debate.failed",
                  data: { debateId, reason: (err as Error).message },
               });
            } finally {
               subscriber.complete();
            }
         };

         run();
         return () => {
            cancelled = true;
         };
      });
   }
}
