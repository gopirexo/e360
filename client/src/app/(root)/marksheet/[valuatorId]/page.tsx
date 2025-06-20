"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/(root)/components/Navbar";
import ExportPDFButton from "@/app/(root)/components/MarksLIst";
import { serverUrl } from "@/utils/utils";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Link from "next/link";
import { FaChartLine } from "react-icons/fa";

export interface Mark {
	id: number;
	name: string;
	rollNo: string;
	marks: string;
	isChecked: boolean;
}

type Params = {
	params: {
		valuatorId: string;
	};
};

export default function MarkList({ params: { valuatorId } }: Params) {
	const [valuator, setValuator] = useState<any>(null);
	const [marksheet, setMarksheet] = useState<any>([]);
	const [searchTerm, setSearchTerm] = useState("");

	const getValuator = async () => {
		try {
			const res = await axios.post(
				`${serverUrl}/valuators/byId`,
				{ id: valuatorId },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			setValuator(res.data);
		} catch (err) {
			toast.error("Failed to fetch valuator");
		}
	};

	const getMarksheet = async () => {
		try {
			const res = await axios.post(
				`${serverUrl}/valuators/marksheet`,
				{ valuatorId },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			setMarksheet(res.data);
		} catch (err) {
			toast.error("Failed to fetch marksheet");
		}
	};

	useEffect(() => {
		getValuator();
		getMarksheet();
	}, []);

	// Filter marksheet
	const filteredMarks = marksheet.filter((row: any) =>
		row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		row.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<>
			<Navbar />
			<main className="p-10 w-full">
				<div className="mb-10 flex justify-between items-center flex-wrap gap-3">
					<ExportPDFButton data={marksheet} />
					<input
						type="text"
						placeholder="Search by name or roll number"
						className="input input-bordered w-80"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				<div className="overflow-x-auto">
					<h3 className="font-bold text-2xl ml-5 mb-5">{valuator?.title} - Marksheet</h3>
					<table className="table table-zebra w-full">
						<thead>
							<tr className="text-center">
								<th>#</th>
								<th>Name</th>
								<th>Roll No</th>
								<th>Marks</th>
								<th className="text-center">Performance</th>
							</tr>
						</thead>
						<tbody>
							{filteredMarks.map((row: any, index: number) => (
								<tr className="text-center" key={index}>
									<th>{index + 1}</th>
									<td>{row.name}</td>
									<td>{row.rollNo}</td>
									<td>{row.marks}</td>
									<td>
										<Link href={`/performance/${row.rollNo}`}>
											<button className="btn btn-sm text-green-600 border border-green-500 hover:border-[2px] hover:font-bold hover:border-green-600 hover:bg-green-100 transition-all duration-200 flex items-center gap-2">
												<FaChartLine />
												Performance
											</button>
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</main>
			<ToastContainer />
		</>
	);
}
