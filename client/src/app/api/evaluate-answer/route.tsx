import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { question, answer } = await req.json();

    const prompt = `
You are a marks evaluator. Below is a question and a student's answer. Evaluate the answer and provide a score out of 10 with a brief explanation.

Question:
${question}

Answer:
${answer}

Evaluation:
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert teacher evaluating student answers.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const evaluation = completion.choices[0].message.content;

    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error('Error in evaluate-answer API:', error);
    return NextResponse.json({ error: 'Failed to evaluate answer' }, { status: 500 });
  }
}
