"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FiZap } from "react-icons/fi";

interface QuestionPaper {
  examName: string;
  questionPaper: string;
}

const AiPracticeSection = () => {
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuestionPapers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/student/question-papers", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setQuestionPapers(res.data || []);
      } catch (error) {
        toast.error("Failed to load question papers");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionPapers();
  }, []);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-5 flex items-center">
        <FiZap className="mr-2" /> AI Practice
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : questionPapers.length === 0 ? (
        <p className="text-gray-500">No question papers found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questionPapers.map((item, idx) => (
            <div key={idx} className="card bg-base-200 p-4 rounded-xl shadow-lg">
              <p className="font-semibold text-lg mb-2">{item.examName}</p>
              <img
                src={item.questionPaper}
                alt={`Question paper for ${item.examName}`}
                className="rounded-lg w-full h-[200px] object-contain"
              />
              <button
                className="btn btn-primary mt-3 w-full"
                onClick={() => {
                  console.log("Start AI Practice for:", item.examName);
                  // TODO: Implement question generation + answer form
                }}
              >
                Practice with AI
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiPracticeSection;
