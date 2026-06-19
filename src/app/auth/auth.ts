import api from "shared/api/axiosInstance";

interface AuthResponse {
   accessToken?: string;
   refreshToken?: string;
   access_token?: string;
   refresh_token?: string;
}

export async function register(data: {
   email: string;
   password: string;
   username: string;
}) {
   const res = await api.post<AuthResponse>("/auth/register", data);
   return res.data;
}

export async function login(data: {
   email: string;
   password: string;
}) {
   const res = await api.post<AuthResponse>("/auth/login", data);
   return res.data;
}

export async function refreshToken(refreshToken: string) {
   const res = await api.post<AuthResponse>("/auth/refresh", {
      refreshToken,
   });

   return res.data;
}

export function saveTokens(data: AuthResponse) {
   const accessToken = data.accessToken ?? data.access_token;
   const refreshToken = data.refreshToken ?? data.refresh_token;

   if (accessToken) localStorage.setItem("accessToken", accessToken);
   if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens() {
   localStorage.removeItem("accessToken");
   localStorage.removeItem("refreshToken");
}