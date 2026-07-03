import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export type AgentEvent = { event: string; data: Record<string, unknown> };

export type EventsResponse = {
   debateId: string;
   done: boolean;
   events: AgentEvent[];
   nextIndex: number;
};

export type StartResponse = {
   debateId: string;
   strategy: string;
   models: string[];
   roster: { model: string; role: string }[];
};

@Injectable()
export class AgentSystemService {
   private readonly agentUrl: string;
   private readonly agentKey: string;

   constructor(private readonly configService: ConfigService) {
      this.agentUrl = configService.get<string>("AGENT_SYSTEM_URL", "http://127.0.0.1:8000");
      this.agentKey = configService.get<string>("AGENT_SYSTEM_API_KEY", "change-me-shared-secret");
   }

   private headers(): Record<string, string> {
      return {
         "Content-Type": "application/json",
         "X-Agent-Key": this.agentKey,
      };
   }

   async start(body: object): Promise<StartResponse> {
      const res = await fetch(`${this.agentUrl}/debates/start`, {
         method: "POST",
         headers: this.headers(),
         body: JSON.stringify(body),
      });

      if (!res.ok) {
         const detail = await res.text();
         throw new HttpException({ message: "agent-system rejected", detail }, res.status);
      }

      return (await res.json()) as StartResponse;
   }

   async detect(body: object): Promise<unknown> {
      return this.post("/debates/detect", body);
   }

   async intake(body: object): Promise<unknown> {
      return this.post("/debates/intake", body);
   }

   async health(): Promise<unknown> {
      return this.get("/health");
   }

   async roles(): Promise<unknown> {
      return this.get("/roles");
   }

   async pingStart(): Promise<unknown> {
      return this.post("/debates/ping", {});
   }

   async pingStatus(checkId: string): Promise<unknown> {
      return this.get(`/debates/ping/${checkId}`);
   }

   private async post(path: string, body: object): Promise<unknown> {
      const res = await fetch(`${this.agentUrl}${path}`, {
         method: "POST",
         headers: this.headers(),
         body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new HttpException(data as object, res.status);
      return data;
   }

   private async get(path: string): Promise<unknown> {
      const res = await fetch(`${this.agentUrl}${path}`, { headers: this.headers() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new HttpException(data as object, res.status);
      return data;
   }

   async fetchEvents(debateId: string, since = 0): Promise<EventsResponse | null> {
      const res = await fetch(
         `${this.agentUrl}/debates/${debateId}/events?since=${since}`,
         { headers: this.headers() }
      );
      if (res.status === 404) return null;
      if (!res.ok) throw new HttpException("agent-system events error", res.status);
      return (await res.json()) as EventsResponse;
   }

   buildDebateObject(debateId: string, events: AgentEvent[]) {
      const started = events.find((e) => e.event === "debate.started")?.data ?? {};
      const improved = [...events].reverse().find((e) => e.event === "thesis.improved")?.data;
      const completed = events.some((e) => e.event === "debate.completed");
      const failed = events.some((e) => e.event === "debate.failed");

      const thesis = (started.thesis as string) ?? "";
      const currentThesis = (improved?.thesis as string) ?? thesis;
      const models = (started.models as string[]) ?? [];
      const strategy = (started.strategy as string) ?? "VERIFY";

      return {
         id: debateId,
         debateId,
         status: {
            state: failed ? "Failed" : completed ? "Completed" : "Live",
            variant: strategy === "QUANTUM" ? "quantum" : "live",
         },
         user: { name: "Anonymous" },
         title: thesis,
         subtitle: currentThesis,
         currentThesis,
         tags: models.map((m) => ({ id: m, name: m })),
         views: 0,
         strategy,
         createdAt: new Date().toISOString(),
      };
   }
}
