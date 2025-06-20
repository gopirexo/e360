import { NextResponse } from "next/server";

export async function GET() {
  // fetch exams from external API or DB through your backend API or service
  const exams = await fetch('http://localhost:3000/api/exams')  // or actual backend URL
    .then(res => res.json());

  return NextResponse.json(exams);
}
