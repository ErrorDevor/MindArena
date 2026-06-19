import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
   const { path } = await params;

   const url = `${BACKEND_API_URL}/${path.join("/")}${req.nextUrl.search}`;

   const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

   const response = await fetch(url, {
      method: req.method,
      headers: {
         "content-type": req.headers.get("content-type") || "application/json",
         authorization: req.headers.get("authorization") || "",
      },
      body,
   });

   const data = await response.text();

   return new NextResponse(data, {
      status: response.status,
      headers: {
         "content-type": response.headers.get("content-type") || "application/json",
      },
   });
}

export {
   handler as GET,
   handler as POST,
   handler as PUT,
   handler as PATCH,
   handler as DELETE,
};