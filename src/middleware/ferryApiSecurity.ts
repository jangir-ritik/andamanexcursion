import { NextRequest } from "next/server";

export const validateApiAccess = (operator: string) => {
  const rateLimiter = new Map<string, number[]>();
  const RATE_LIMIT = parseInt(process.env.FERRY_API_RATE_LIMIT || "100");

  return (req: NextRequest  ) => {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const minute = Math.floor(now / 60000);

    if (!rateLimiter.has(ip)) {
      rateLimiter.set(ip, []);
    }

    const requests = rateLimiter.get(ip)!;
    const recentRequests = requests.filter((time) => time > minute - 1);

    if (recentRequests.length >= RATE_LIMIT) {
      throw new Error("Rate limit exceeded");
    }

    recentRequests.push(minute);
    rateLimiter.set(ip, recentRequests);
  };
};
