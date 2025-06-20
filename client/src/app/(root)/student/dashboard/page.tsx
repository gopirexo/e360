"use client";

import React from "react";
import Navbar from "./components/Navbar"; // ✅ Add this

// ...rest of your code


interface Exam {
  id: string;
  name: string;
  // add other fields if needed
}

interface QuestionPaper {
  id: string;
  name: string;
  url: string;
}

interface Params {
  // if needed, for dynamic routing
}

async function getExams(): Promise<Exam[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/student/exams`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch exams");
  return res.json();
}

async function getQuestionPapers(): Promise<QuestionPaper[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/student/question-papers`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch question papers");
  return res.json();
}

export default async function StudentDashboard() {
  const exams = await getExams();
  const questionPapers = await getQuestionPapers();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Exams</h2>
        <ul className="list-disc list-inside">
          {exams.map((exam) => (
            <li key={exam.id}>{exam.name}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Question Papers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {questionPapers.map((paper) => (
            <div key={paper.id} className="border p-4 rounded shadow">
              <h3 className="font-semibold mb-2">{paper.name}</h3>
              <img
                src={paper.url}
                alt={paper.name}
                className="w-full h-auto rounded"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
