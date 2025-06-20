import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';  // Import the OpenAI SDK correctly

// Create an instance of the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Make sure your OpenAI API key is in your .env.local file
});

export async function POST(req: Request) {
  const { questionPaperText } = await req.json();

  // Validate if questionPaperText is provided
  if (!questionPaperText || questionPaperText.trim() === '') {
    return NextResponse.json({
      error: 'Invalid input: Please provide valid question paper text.',
    }, { status: 400 });
  }

  try {
    // Request to OpenAI's API to generate questions based on the content provided
    const response = await openai.chat.completions.create({
      model: 'gpt-4', // or gpt-4o, depending on your API subscription
      messages: [
        { role: 'system', content: 'Generate questions based on the following content.' },
        { role: 'user', content: questionPaperText },
      ],
    });

    // Return the generated questions
    return NextResponse.json({
      questions: response.choices[0].message.content,
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json({
      error: 'Error generating questions. Please try again later.',
    }, { status: 500 });
  }
}
