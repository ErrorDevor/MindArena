import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

async function handler(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
   if (!BACKEND_API_URL) {
      return NextResponse.json({ message: "BACKEND_API_URL is not set" }, { status: 500 });
   }

   const { path } = await context.params;

   const url = `${BACKEND_API_URL}/${path.join("/")}${req.nextUrl.search}`;

   const isStream = path[path.length - 1] === "stream";

   const accessTokenFromCookie = req.cookies.get("accessToken")?.value;
   const authorizationFromHeader = req.headers.get("authorization");

   const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

   const response = await fetch(url, {
      method: req.method,
      headers: {
         "content-type": req.headers.get("content-type") || "application/json",
         accept: isStream ? "text/event-stream" : req.headers.get("accept") || "application/json",
         authorization:
            authorizationFromHeader ||
            (accessTokenFromCookie ? `Bearer ${accessTokenFromCookie}` : ""),
      },
      body,
   });

   if (isStream) {
      return new NextResponse(response.body, {
         status: response.status,
         headers: {
            "content-type": "text/event-stream",
            "cache-control": "no-cache, no-transform",
            connection: "keep-alive",
         },
      });
   }

   const data = await response.text();

   return new NextResponse(data, {
      status: response.status,
      headers: {
         "content-type": response.headers.get("content-type") || "application/json",
      },
   });
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
