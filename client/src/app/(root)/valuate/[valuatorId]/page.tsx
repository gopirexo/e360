"use client";
import { UploadButton } from "@/utils/uploadthing";
import Navbar from "../../components/Navbar";
import { useEffect, useState, useCallback } from "react";
import { serverUrl } from "@/utils/utils";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { AiFillCheckCircle, AiOutlineFileDone } from "react-icons/ai";
import { FiCheckCircle, FiUpload } from "react-icons/fi";
import { CiTrophy } from "react-icons/ci";

type Params = {
  params: {
    valuatorId: string;
  };
};

export default function Page({ params: { valuatorId } }: Params) {
  const [valuator, setValuator] = useState<any>(null);
  const [answerSheets, setAnswerSheets] = useState<any>([]);
  const [results, setResults] = useState<any>([]);
  const [currentValuatingSheet, setCurrentValuatingSheet] = useState<number>(1);
  const [valuating, setValuating] = useState<boolean>(false);

  const getValuator = useCallback(async () => {
    try {
      const response = await axios.post(
        `${serverUrl}/valuators/byId`,
        { id: valuatorId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setValuator(response.data);
    } catch (error) {
      toast.error("Failed to fetch valuators");
    }
  }, [valuatorId]); // ✅ useCallback prevents unnecessary re-renders

  useEffect(() => {
    getValuator();
  }, [getValuator]);

  const valuateAnswerSheets = async () => {
    (document.getElementById("valuation_modal") as any).showModal();
    setValuating(true);
    for (const answerSheet of answerSheets) {
      await valuate(answerSheet.url);
      setCurrentValuatingSheet((prev) => prev + 1);
    }
    toast.success("Valuation completed");
    setValuating(false);
    (document.getElementById("valuation_modal") as any).close();
    setTimeout(() => {
      window.location.href = `/review/${valuatorId}`;
    }, 1000);
  };

  const valuate = async (answerSheet: string) => {
    try {
      const response = await axios.post(
        `${serverUrl}/valuators/valuate`,
        {
          valuatorId: valuatorId,
          answerSheet: answerSheet,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setResults((prevResults: any[]) => [...prevResults, response.data]);
      localStorage.setItem("results", JSON.stringify([...results, response.data]));
    } catch (error) {
      toast.error("Failed to valuate answer sheet");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col p-5">
        <div className="flex items-center mb-10 justify-between">
          <h1 className="font-bold text-4xl flex items-center">
            <AiOutlineFileDone className="mr-2" /> {valuator?.title}
          </h1>
          <div className="flex">
            <button className="btn btn-primary btn-md mr-2" onClick={() => window.location.href = `/review/${valuatorId}`}>
              <FiCheckCircle /> Review Answer Sheets
            </button>
            <button className="btn btn-primary btn-md" onClick={() => window.location.href = `/marksheet/${valuatorId}`}>
              <CiTrophy /> View Marksheet
            </button>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-5 flex items-center">
          <FiUpload className="mr-2" /> Upload answer sheets
        </h3>
        <div className="flex flex-col">
          {answerSheets.length > 0 ? (
            <div className="flex flex-col">
              <p className="font-semibold mb-5 text-xl">Answer Sheets Uploaded:</p>
              {answerSheets.map((answerSheet: any, index: number) => (
                <p key={index} className="flex items-center mb-2">
                  <AiFillCheckCircle className="text-2xl mr-2 text-green-500" />{answerSheet?.url}
                </p>
              ))}
            </div>
          ) : (
            <UploadButton
              endpoint="media"
              onClientUploadComplete={(res) => setAnswerSheets(res)}
              onUploadError={(error: Error) => alert(`ERROR! ${error.message}`)}
            />
          )}
        </div>
        {answerSheets.length > 0 && (
          <div>
            <button className="btn btn-primary mt-10 btn-lg" onClick={valuateAnswerSheets}>
              <FiCheckCircle className="mr-1" /> Start Valuation
            </button>
          </div>
        )}
        <ToastContainer />
      </div>
      <dialog id="valuation_modal" className="modal">
        <div className="modal-box max-w-2xl align-middle">
          <h3 className="flex items-center font-bold text-2xl mb-5">
            <FiCheckCircle className="mr-2" /> Valuating Answer Sheets
          </h3>
          <div className="my-10 flex flex-col items-center justify-center">
            <span className="loading loading-spinner loading-lg mb-10"></span>
            <p className="text-lg mb-5">Valuating Answer Sheet {currentValuatingSheet} of {answerSheets?.length}</p>
            <progress className="progress mb-5 w-[20vw]" value={currentValuatingSheet / answerSheets?.length * 100} max="100"></progress>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};
