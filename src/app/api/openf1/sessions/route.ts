import { NextResponse } from "next/server";
import { getLatestSessions } from "@/lib/openf1";

export async function GET() {
  try {
    const sessions = await getLatestSessions();
    return NextResponse.json({ source: "race-data", cached: true, sessions });
  } catch (error) {
    return NextResponse.json({ source: "fallback", error: error instanceof Error ? error.message : "Race data unavailable", sessions: [] }, { status: 206 });
  }
}
