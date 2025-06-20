"use client";

import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UploadButton } from "@/utils/uploadthing";
import axios from "axios";
import { serverUrl } from "@/utils/utils";
import { ToastContainer, toast } from "react-toastify";
import {
  AiFillCheckCircle,
  AiOutlineEye,
  AiOutlineEdit,
  AiOutlineDelete,
} from "react-icons/ai";
import { FiPlusCircle } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Home() {
  const [valuators, setValuators] = useState([]);
  const [title, setTitle] = useState("");
  const [questionPaperUrl, setQuestionPaperUrl] = useState("");
  const [answerKeyUrl, setAnswerKeyUrl] = useState("");
  const [creatingValuator, setCreatingValuator] = useState(false);

  const router = useRouter();

  const getValuators = async () => {
    try {
      const res = await axios.get(`${serverUrl}/valuators`);
      setValuators(res.data);
    } catch (err) {
      toast.error("Failed to fetch valuators");
    }
  };

  const createValuator = async () => {
    setCreatingValuator(true);
    try {
      await axios.post(`${serverUrl}/valuators`, {
        title,
        questionPaper: questionPaperUrl,
        answerKey: answerKeyUrl,
      });
      toast.success("Valuator created successfully!");
      getValuators();
      setCreatingValuator(false);
      (document.getElementById("new_valuation_modal") as any).close();
    } catch (err) {
      toast.error("Error creating valuator!");
      setCreatingValuator(false);
    }
  };

  useEffect(() => {
    getValuators();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">📘 My Valuators</h1>
            <button
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              onClick={() =>
                (document.getElementById("new_valuation_modal") as any)?.showModal()
              }
            >
              + Create Valuator
            </button>
          </div>

          <input
            type="text"
            placeholder="Search Valuators..."
            className="w-full mb-6 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="space-y-4">
            {valuators.length === 0 && (
              <p className="text-gray-500">
                No valuators found. Click &quot;Create Valuator&quot; to get started.
              </p>
            )}

            {valuators.map((item: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-gray-50 rounded-xl px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item?.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                    {item?.valuations} valuations
                  </span>
                  <div className="flex items-center gap-4 text-xl text-gray-400">
                    <AiOutlineEye
                      title="View"
                      className="hover:text-blue-600 cursor-pointer"
                      onClick={() => router.push(`/valuate/${item._id}`)}
                    />
                    <AiOutlineEdit
                      title="Edit"
                      className="hover:text-green-600 cursor-pointer"
                    />
                    <AiOutlineDelete
                      title="Delete"
                      className="hover:text-red-600 cursor-pointer"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal for new valuator */}
      <dialog id="new_valuation_modal" className="modal">
        <div className="modal-box w-full max-w-2xl backdrop-blur-md bg-white/90 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FiPlusCircle className="mr-2" /> Create New Valuator
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Exam Title</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Upload Question Paper
              </label>
              <div className="flex items-center gap-2">
                {questionPaperUrl && (
                  <AiFillCheckCircle className="text-green-500 text-xl" />
                )}
                {questionPaperUrl || (
                  <UploadButton
                    endpoint="media"
                    onClientUploadComplete={(res) =>
                      setQuestionPaperUrl(res![0].url)
                    }
                    onUploadError={(error: Error) =>
                      alert(`Upload Error: ${error.message}`)
                    }
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Upload Answer Key
              </label>
              <div className="flex items-center gap-2">
                {answerKeyUrl && (
                  <AiFillCheckCircle className="text-green-500 text-xl" />
                )}
                {answerKeyUrl || (
                  <UploadButton
                    endpoint="media"
                    onClientUploadComplete={(res) =>
                      setAnswerKeyUrl(res![0].url)
                    }
                    onUploadError={(error: Error) =>
                      alert(`Upload Error: ${error.message}`)
                    }
                  />
                )}
              </div>
            </div>

            <button
              className="btn btn-primary w-full mt-4"
              disabled={
                !title || !questionPaperUrl || !answerKeyUrl || creatingValuator
              }
              onClick={createValuator}
            >
              {creatingValuator ? "Creating..." : "Create Valuator"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <ToastContainer />
    </div>
  );
}
