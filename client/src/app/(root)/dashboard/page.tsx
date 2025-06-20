"use client";

import { FiUsers, FiBookOpen, FiActivity, FiSettings } from "react-icons/fi";
import { AiOutlinePieChart } from "react-icons/ai";
import { HiOutlineDocumentReport } from "react-icons/hi";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const cards = [
    {
      title: "Evaluators",
      icon: <FiUsers className="text-4xl text-blue-600" />,
      href: "/dashboard/evaluators",
    },
    {
      title: "Classes",
      icon: <FiBookOpen className="text-4xl text-blue-600" />,
      href: "/dashboard/classes",
    },
    {
      title: "Usage & Limits",
      icon: <FiActivity className="text-4xl text-blue-600" />,
      href: "/dashboard/limits",
    },
    {
      title: "Performance Graph",
      icon: <AiOutlinePieChart className="text-4xl text-blue-600" />,
      href: "/dashboard/performance",
    },
    {
      title: "Reports",
      icon: <HiOutlineDocumentReport className="text-4xl text-blue-600" />,
      href: "/dashboard/reports",
    },
    {
      title: "Settings",
      icon: <FiSettings className="text-4xl text-blue-600" />,
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 flex items-center">
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-3"
            height="1.5em"
            width="1.5em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <Link href={card.href} key={idx}>
              <div className="cursor-pointer border-2 border-gray-300 rounded-xl p-6 bg-white hover:border-4 hover:border-primary hover:shadow-lg transition-all flex items-center gap-4">
                {card.icon}
                <span className="text-xl font-semibold text-gray-800">
                  {card.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
