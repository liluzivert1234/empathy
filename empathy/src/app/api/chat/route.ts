import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

    const model = client.getGenerativeModel({
      model: "gemma-3-27b-it",
    });

    const prompt = messages
      .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    return NextResponse.json({
      message: { role: "assistant", content: text },
    });
  } catch (err: any) {
    console.error("Gemma 3 API Error:", err);
    return NextResponse.json(
      { error: "Gemma API failed", detail: err.message },
      { status: 500 }
    );
  }
}
