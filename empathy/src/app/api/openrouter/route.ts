import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-3.3-70b-instruct",
      messages,
      temperature: 0.8,
      top_p: 0.9,
      max_tokens: 2000,
    });

    const content = completion.choices?.[0]?.message?.content || "";

    // Return final response to frontend
    return NextResponse.json({ message: { content } });
  } catch (err: any) {
    console.error("OpenRouter API Error:", err);
    return NextResponse.json(
      { error: "Error generating response" },
      { status: 500 }
    );
  }
}
