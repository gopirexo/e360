"use client";

import { useState, useEffect } from "react";
import AiPracticeSection from "./components/AiPracticeSection";
import { FiUser, FiBookOpen, FiZap } from "react-icons/fi";

const StudentDashboard = () => {
  const [tab, setTab] = useState<"profile" | "exams" | "ai">("profile");
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch("/api/student/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setStudentData(data);
      } catch (err) {
        console.error("Failed to fetch student data", err);
      }
    };

    fetchStudent();
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <button
          className={`btn ${tab === "profile" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setTab("profile")}
        >
          <FiUser className="mr-2" /> Profile
        </button>
        <button
          className={`btn ${tab === "exams" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setTab("exams")}
        >
          <FiBookOpen className="mr-2" /> Exam History
        </button>
        <button
          className={`btn ${tab === "ai" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setTab("ai")}
        >
          <FiZap className="mr-2" /> AI Practice
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {tab === "profile" && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
            {studentData ? (
              <div className="bg-base-200 p-4 rounded-lg shadow">
                <p><strong>Name:</strong> {studentData.name}</p>
                <p><strong>Email:</strong> {studentData.email}</p>
              </div>
            ) : (
              <p>Loading profile...</p>
            )}
          </div>
        )}

        {tab === "exams" && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Your Exams</h2>
            <p>Display past exams and scores here (to be implemented).</p>
          </div>
        )}

        {tab === "ai" && (
          <AiPracticeSection />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
