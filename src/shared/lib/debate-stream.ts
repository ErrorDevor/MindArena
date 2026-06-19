import { fetchEventSource } from "@microsoft/fetch-event-source";

export type DebateEventName =
   | "debate.started"
   | "round.started"
   | "agent.attack.created"
   | "attack.verified"
   | "thesis.improved"
   | "round.completed"
   | "debate.completed"
   | "debate.failed";

type StreamHandlers = {
   onEvent?: (event: DebateEventName, data: Record<string, unknown>) => void;
   onCompleted?: (data: Record<string, unknown>) => void;
   onFailed?: () => void;
   onClose?: () => void;
};

export function streamDebate(debateId: string, handlers: StreamHandlers) {
   const controller = new AbortController();
   const token = localStorage.getItem("access_token");

   fetchEventSource(`${process.env.NEXT_PUBLIC_API_URL}/debates/${debateId}/stream`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
      onmessage(ev) {
         const data = ev.data ? JSON.parse(ev.data) : {};
         const eventName = ev.event as DebateEventName;

         handlers.onEvent?.(eventName, data);

         if (eventName === "debate.completed") handlers.onCompleted?.(data);
         if (eventName === "debate.failed") handlers.onFailed?.();
      },
      onerror() {
         handlers.onFailed?.();
         controller.abort();
      },
      onclose() {
         handlers.onClose?.();
      },
   });

   // Повертаємо функцію закриття з'єднання
   return () => controller.abort();
}
