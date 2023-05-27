import { getEmbedding } from "@/utils/openai";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body) return NextResponse.json({ error: "no body" }, { status: 400 });
  if (typeof body.apiKey !== "string") return NextResponse.json({ error: "no apikey" }, { status: 400 });
  try {
    await getEmbedding(body.apiKey, "test")
    return NextResponse.json({ valid: true })
  } catch (e) {
    return NextResponse.json({ valid: false })
  }
}