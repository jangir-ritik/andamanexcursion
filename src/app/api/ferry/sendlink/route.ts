import { NextRequest } from "next/server";

// pages/api/ferry/sendlink.js or app/api/ferry/sendlink/route.js
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(
      "http://api.dev.gonautika.com:8012/getTripData",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "1234567890",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
