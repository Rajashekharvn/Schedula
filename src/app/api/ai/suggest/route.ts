import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/ai/suggest — parse natural language scheduling intent
export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI feature not configured" }, { status: 503 });
  }

  const { message, timezone } = await req.json();
  if (!message) return NextResponse.json({ error: "message is required" }, { status: 400 });

  const today = new Date().toISOString().split("T")[0];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a scheduling assistant. Today is ${today}. The user's timezone is ${timezone || "UTC"}.
Extract a specific date from the user's message. Respond ONLY with valid JSON in this exact format:
{"date": "YYYY-MM-DD", "explanation": "brief human-friendly explanation"}
If you cannot extract a clear date, respond with: {"date": null, "explanation": "explanation of what you need"}`,
      },
      { role: "user", content: message },
    ],
    temperature: 0.1,
    max_tokens: 100,
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ date: null, explanation: "Could not parse that. Please try again." });
  }
}
