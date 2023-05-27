import { get_encoding } from "@dqbd/tiktoken"
import { NextRequest, NextResponse } from "next/server"
export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body) return NextResponse.json({ error: "no body" }, { status: 400 })
  if (typeof body.text !== "string") return NextResponse.json({ error: "invalid text" }, { status: 400 });
  const enc = get_encoding("cl100k_base")
  return NextResponse.json({ tokens: enc.encode(body.text).length })
}