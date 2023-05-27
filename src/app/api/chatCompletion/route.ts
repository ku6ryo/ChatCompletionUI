import { getChatCompletion } from "@/utils/openai";
import { NextRequest, NextResponse } from "next/server";
import { get_encoding } from "@dqbd/tiktoken"
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body) return NextResponse.json({ error: "no body" }, { status: 400 });
  if (typeof body.apiKey !== "string") return NextResponse.json({ error: "no apikey" }, { status: 400 });
  if (!Array.isArray(body.messages)) return NextResponse.json({ error: "invalid messages" }, { status: 400 });
  const answer = await getChatCompletion(body.apiKey, body.messages)
  const a = answer || ""
  const enc = get_encoding("cl100k_base")
  return NextResponse.json({ answer: a, tokens: enc.encode(a).length })
}