"use client";

import { useState } from "react";
import axios from "axios";
import { serverUrl } from "@/utils/utils";

export default function AIEvalPage() {
  const [answer, setAnswer] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    setQuestions([]);

    try {
      const res = await axios.post(`${serverUrl}/generate-questions`, {
        answerText: answer,
      });

      const raw = res.data.questions;
      const split = raw.split(/\n/).filter((line: string) => line.trim());
      setQuestions(split);
    } catch (err) {
      console.error("Error generating questions:", err);
      alert("Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-tr from-purple-100 via-blue-100 to-pink-100">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          ✍️ AI Question Generator
        </h1>

        <textarea
          rows={6}
          className="w-full p-4 border rounded-xl border-gray-300 mb-4"
          placeholder="Paste or type student's answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-semibold"
        >
          {loading ? "Generating..." : "Generate Questions"}
        </button>

        {questions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              🧠 Generated Questions:
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              {questions.map((q, idx) => (
                <li key={idx} className="text-gray-800">
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
