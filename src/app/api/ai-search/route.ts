import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = body?.query;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Invalid query" },
        { status: 400 }
      );
    }

    const prompt = `
User searched for: "${query}"

Return a JSON with:
{
  "refinedQuery": "clean improved search phrase",
  "category": "one of: Electronics, Fashion, Mobiles, Vehicles, Home, Sports, Services"
}

Respond ONLY with valid JSON.
`;

    const ai = await client.responses.create({
      model: "gpt-4.1",
      input: prompt,
    });

    const text = ai.output_text;

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      result = {
        refinedQuery: query,
        category: "All",
      };
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("AI Search Error:", error);

    // Fallback response (no query used here)
    return NextResponse.json(
      { refinedQuery: "", category: "All" },
      { status: 200 }
    );
  }
}
