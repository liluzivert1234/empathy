import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  try {

    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    const apiResponse = await client.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: formattedMessages,
    });

    const responseMessage = apiResponse.choices[0].message;


    return NextResponse.json({
      message: {
        role: "assistant",
        content: responseMessage.content,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
