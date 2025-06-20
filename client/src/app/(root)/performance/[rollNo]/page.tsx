"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { serverUrl } from "@/utils/utils";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function PerformanceGraphPage() {
  const params = useParams();
  const rollNo = params?.rollNo;

  const [graphData, setGraphData] = useState([]);
  const [progressSummary, setProgressSummary] = useState("");
  const [studySuggestions, setStudySuggestions] = useState("");
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const fetchGraph = async () => {
    try {
      const res = await axios.post(`${serverUrl}/valuators/performance-graph`, { rollNo });
      setGraphData(res.data);
    } catch (err) {
      console.error("Error loading graph", err);
    } finally {
      setLoadingGraph(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await axios.post(`${serverUrl}/valuators/gpt-insights`, { rollNo });
      setProgressSummary(res.data?.progressSummary || "No progress data available.");
      setStudySuggestions(res.data?.studySuggestions || "No suggestions available.");
    } catch (err) {
      console.error("Error loading insights", err);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (rollNo) {
      fetchGraph();
      fetchInsights();
    }
  }, [rollNo]);

  return (
    <main className="p-6 md:p-10 bg-gradient-to-br from-blue-50 via-white to-purple-100 min-h-screen">
      <Link href="/home" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <FiArrowLeft className="mr-2" /> Back
      </Link>

      <h1 className="text-4xl font-extrabold text-gray-800 mb-6">📊 Performance Overview</h1>
      <h2 className="text-xl font-medium text-gray-600 mb-10">Roll No: <span className="font-semibold text-blue-700">{rollNo}</span></h2>

      {loadingGraph ? (
        <p className="text-gray-500">Loading performance graph...</p>
      ) : graphData.length === 0 ? (
        <p className="text-red-500">No performance data found.</p>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={graphData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="examName" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#6366f1" name="Scored" />
              <Line type="monotone" dataKey="max" stroke="#10b981" name="Max Marks" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <div className="p-6 bg-white rounded-xl shadow-lg border border-blue-100">
          <h3 className="text-2xl font-bold text-blue-600 mb-4">📈 Progress Over Time</h3>
          {loadingInsights ? (
            <p className="text-gray-500">Loading summary...</p>
          ) : (
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{progressSummary}</div>
          )}
        </div>

        <div className="p-6 bg-white rounded-xl shadow-lg border border-purple-100">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">📚 Study Suggestions</h3>
          {loadingInsights ? (
            <p className="text-gray-500">Loading suggestions...</p>
          ) : (
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{studySuggestions}</div>
          )}
        </div>
      </div>
    </main>
  );
}
