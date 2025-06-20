"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { serverUrl } from "@/utils/utils";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { FiArrowLeft, FiCpu, FiStar, FiUser } from "react-icons/fi";
import { AiOutlineTrophy } from "react-icons/ai";
import Navbar from "../../components/Navbar";

type Params = {
	params: {
		valuatorId: string;
	};
};

const ViewAnswerPage = ({ params: { valuatorId } }: Params) => {
	const [valuations, setValuations] = useState<any[]>([]);
	const [totalMarks, setTotalMarks] = useState<any>(null);
	const [selectedValuation, setSelectedValuation] = useState<number>(0);
	const [view, setView] = useState<number>(0);

	const getValuations = useCallback(async () => {
		try {
			const response = await axios.post(`${serverUrl}/valuators/valuations`, {
				valuatorId,
			}, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
					"Content-Type": "application/json",
				},
			});
			setValuations(response.data);
		} catch (error) {
			toast.error("Failed to fetch valuations");
		}
	}, [valuatorId]);

	const getTotalMarks = useCallback(async () => {
		if (!valuations[selectedValuation]?._id) return;
		try {
			const response = await axios.post(`${serverUrl}/valuators/total-marks`, {
				valuationId: valuations[selectedValuation]._id,
			}, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
					"Content-Type": "application/json",
				},
			});
			setTotalMarks(response.data);
		} catch (error) {
			toast.error("Failed to fetch total marks");
		}
	}, [valuations, selectedValuation]);

	useEffect(() => {
		getValuations();
	}, [getValuations]);

	useEffect(() => {
		if (valuations.length > 0) {
			getTotalMarks();
		}
	}, [valuations, selectedValuation, getTotalMarks]);

	return (
		<div className="w-full h-full flex flex-col">
			<Navbar />
			<div className="flex justify-between z-50 p-5 fixed navbar backdrop-filter backdrop-blur-lg bg-opacity-30 bg-base-100">
				<div className="flex items-center">
					<button className="btn btn-square mr-5" onClick={() => window.location.href = `/valuate/${valuatorId}`}><FiArrowLeft className="text-2xl" /></button>
					<div className="flex items-center">
						<p className="font-semibold text-2xl min-w-fit mr-10">{totalMarks?.examName}</p>
						<p className="mr-5 flex items-center font-semibold text-lg"><FiUser className="mr-2" /> Student: </p>
						<select className="text-xl select select-bordered w-full max-w-xs" value={selectedValuation} onChange={(e) => setSelectedValuation(Number(e.target.value))}>
							{valuations.map((valuation, index) => (
								<option key={index} value={index}>{index + 1}. {valuation?.data?.student_name}</option>
							))}
						</select>
					</div>
				</div>
			</div>
			<div className="flex w-full h-full">
				<div className="mb-10 p-10 pt-[100px] w-full">
					<p className="font-semibold text-xl mb-5 flex items-center">
						<AiOutlineTrophy className="mr-2" /> Total marks scored: {totalMarks?.totalScore} / {totalMarks?.maxScore}
					</p>
				</div>
				<div className="pt-20 w-[60vw] h-screen mr-5">
					<Image
						src={(valuations[selectedValuation] as any)?.answerSheet || "/default-image.jpg"}
						alt="Answer Sheet"
						width={600}
						height={800}
						className="fixed h-full"
					/>
				</div>
			</div>
			<ToastContainer />
		</div>
	);
};

export default ViewAnswerPage;