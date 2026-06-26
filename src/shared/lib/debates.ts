import api from "shared/api/axiosInstance";

export async function createDebate(
   thesis: string,
   options?: {
      mode?: "CONVERGENT" | "DIVERGENT" | "GEOPOLITICAL";
      maxRounds?: number;
      models?: string[];
   }
) {
   return api.post("/debates", {
      thesis,
      mode: options?.mode ?? "CONVERGENT",
      maxRounds: options?.maxRounds ?? 3,
      models: options?.models ?? ["GPT", "CLAUDE", "GEMINI", "GROK", "GLM", "KIMI"],
   });
}

export async function getDebate(id: string) {
   const res = await api.get(`/debates/${id}`);
   return res.data;
}

export async function listDebates() {
   return api.get("/debates");
}

export async function getFinal(id: string) {
   const res = await api.get(`/debates/${id}/final`);
   return res.data;
}
