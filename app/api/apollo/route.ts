import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/apollo/cache";

const AUTH_KEY = "sdf94$#hjkvgf@hj[mnvG354ruigvHGCGFD";

export const DELETE = async (req: NextRequest) => {
  const { clearAll, cacheKey } = await req.json();
  const authKey = req.headers.get("x-auth-key");
  if (authKey !== AUTH_KEY) {
    return NextResponse.json(
      { error: "For this action you should use auth key" },
      { status: 401 },
    );
  }
  if (!!clearAll) {
    await cache.clear();
    return NextResponse.json({ error: "" });
  }
  if (!!cacheKey) {
    await cache.delete(cacheKey);
    return NextResponse.json({ error: "" });
  }
  return NextResponse.json(
    { error: "We don't have data for clearing" },
    { status: 400 },
  );
};
