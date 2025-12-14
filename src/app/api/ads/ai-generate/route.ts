import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, type, category } = await req.json();

    if (!prompt || !type) {
      return NextResponse.json(
        { error: 'Prompt and ad type are required' },
        { status: 400 }
      );
    }

    // 1️⃣ Generate marketing copy
    const copyResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional digital marketing expert creating short, catchy ads.',
        },
        {
          role: 'user',
          content: `
Create a ${type} ad.
Category: ${category || 'General'}
Business description: ${prompt}

Return:
- Title (max 8 words)
- Description (1 short sentence)
- If video: a 10–15 second video script
          `,
        },
      ],
      temperature: 0.8,
    });

    const text = copyResponse.choices?.[0]?.message?.content ?? '';

    const title =
      text.match(/Title[:\-]\s*(.*)/i)?.[1]?.trim() ||
      'Amazing Offer';

    const description =
      text.match(/Description[:\-]\s*(.*)/i)?.[1]?.trim() ||
      'Limited time offer you will love.';

    const videoScript =
      type === 'video'
        ? text.match(/script[:\-]\s*([\s\S]*)/i)?.[1]?.trim() ?? null
        : null;

    // 2️⃣ Generate image if needed
    let imageUrl: string | null = null;

    if (type === 'image') {
      const imageResponse = await openai.images.generate({
        model: 'gpt-image-1',
        prompt: `
High-quality marketing image.
${prompt}.
Modern, realistic, professional, product-focused.
        `,
        size: '1024x1024',
      });

      if (
        imageResponse.data &&
        imageResponse.data.length > 0 &&
        imageResponse.data[0]?.url
      ) {
        imageUrl = imageResponse.data[0].url;
      }
    }

    return NextResponse.json({
      title,
      description,
      imageUrl,
      videoScript,
      aiGenerated: true,
    });
} catch (error: any) {
  console.error('AI Ad Generation Error:', error);

  if (error?.status === 429) {
    return NextResponse.json(
      {
        error: 'AI quota exceeded',
        message:
          'AI ad generation is temporarily unavailable. Please try again later or contact support.',
      },
      { status: 429 }
    );
  }

  return NextResponse.json(
    { error: 'Failed to generate AI ad' },
    { status: 500 }
  );
}
}
