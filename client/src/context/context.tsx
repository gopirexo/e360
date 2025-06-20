// Context.tsx

import { serverURL } from "@/utils/utils";
import axios from "axios";
import { usePathname } from "next/navigation";
import { createContext, useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";

const MainContext = createContext<any>(null);

function Context({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Main Home States
    const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [user, setUser] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const [limits, setLimits] = useState<any>({});

    // Evaluators Page States
    const [evaluators, setEvaluators] = useState<any[]>([]);
    const [selectedEvaluator, setSelectedEvaluator] = useState<number>(-1);
    const [loadingEvaluator, setLoadingEvaluator] = useState<boolean>(false);
    const [creatingEvaluator, setCreatingEvaluator] = useState<boolean>(false);
    const [newEvaluatorTitle, setNewEvaluatorTitle] = useState<string>("");
    const [newEvaluatorClassId, setNewEvaluatorClassId] = useState<string>("-1");
    const [newEvaluatorQuestionPapers, setNewEvaluatorQuestionPapers] = useState<string[]>([]);
    const [newEvaluatorAnswerKeys, setNewEvaluatorAnswerKeys] = useState<string[]>([]);
    const [editEvaluatorTitle, setEditEvaluatorTitle] = useState<string>("");
    const [editEvaluatorClassId, setEditEvaluatorClassId] = useState<string>("-1");
    const [answerSheets, setAnswerSheets] = useState<any>([]);
    const [evaluationData, setEvaluationData] = useState<any>({});
    const [evaluationProgress, setEvaluationProgress] = useState<any[]>([]);
    const [ongoingEvaluation, setOngoingEvaluation] = useState<any>({
        evaluatorId: "",
    });

    // Classes Page States
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<number>(-1);
    const [newClassName, setNewClassName] = useState<string>("");
    const [newClassSection, setNewClassSection] = useState<string>("");
    const [newClassSubject, setNewClassSubject] = useState<string>("");
    const [editClassName, setEditClassName] = useState<string>("");
    const [editClassSection, setEditClassSection] = useState<string>("");
    const [editClassSubject, setEditClassSubject] = useState<string>("");
    const [loadingClass, setLoadingClass] = useState<boolean>(false);
    const [creatingClass, setCreatingClass] = useState<boolean>(false);
    const [students, setStudents] = useState<any[]>([]);
    const [newStudentName, setNewStudentName] = useState<string>("");
    const [newStudentRollNo, setNewStudentRollNo] = useState<number>(0);
    const [editStudentName, setEditStudentName] = useState<string>("");
    const [editStudentRollNo, setEditStudentRollNo] = useState<number>(-1);
    const [addingStudent, setAddingStudent] = useState<boolean>(false);
    const [deleteStudentRollNo, setDeleteStudentRollNo] = useState<number>(-1);

    // Results Page States
    const [resultData, setResultData] = useState<any>({});
    const [resultDataTable, setResultDataTable] = useState<any>([]);
    const [imgPreviewURL, setImgPreviewURL] = useState<string>("");

    // Ref to hold the EventSource instance
    const eventSourceRef = useRef<EventSource | null>(null);

    // Function to fetch evaluation limits
    const getLimits = async () => {
        try {
            const config = {
                method: "GET",
                url: `${serverURL}/evaluate/evaluators`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            };

            const response = await axios(config);
            setLimits(response.data.limits);
        } catch (error) {
            console.error("Error fetching limits:", error);
            toast.error("Failed to fetch limits.");
        }
    };

    // Function to fetch evaluators
    const getEvaluators = async () => {
        try {
            const config = {
                method: "GET",
                url: `${serverURL}/evaluate/evaluators`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            };

            const response = await axios(config);
            setEvaluators(response.data.evaluators);
            setUser(response.data.user);
            setLimits(response.data.limits);

            const selectedEvaluatorLocalData = parseInt(localStorage.getItem("selectedEvaluator") || "-1");
            setSelectedEvaluator(selectedEvaluatorLocalData);

            if (response.data.evaluators.length === 0 && pathname.includes("evaluators")) {
                localStorage.setItem("selectedEvaluator", "-1");
                setSelectedEvaluator(-1);
                window.location.href = "/home";
            } else if (
                response.data.evaluators.length > 0 &&
                !pathname.includes("evaluators") &&
                !pathname.includes("classes") &&
                !pathname.includes("admin")
            ) {
                localStorage.setItem("selectedEvaluator", "0");
                setSelectedEvaluator(0);
                window.location.href = "/home/evaluators";
            }

            const currentEvaluator = response.data.evaluators[selectedEvaluatorLocalData];
            if (currentEvaluator) {
                await getStudents(currentEvaluator.classId);
                await getEvaluation(currentEvaluator._id);
            }
        } catch (error) {
            console.error("Error fetching evaluators:", error);
            toast.error("Failed to fetch evaluators.");
        }
    };

    // Function to fetch classes
    const getClasses = async () => {
        try {
            const config = {
                method: "GET",
                url: `${serverURL}/class`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            };

            const response = await axios(config);
            setClasses(response.data);
            if (response.data.length > 0 && pathname.includes("classes") && selectedClass === -1) {
                setSelectedClass(0);
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
            toast.error("Failed to fetch classes.");
        }
    };

    // Function to edit an evaluator
    const editEvaluator = async () => {
        if (editEvaluatorClassId === "-1" || editEvaluatorTitle === "") {
            return toast.error("Please fill all the fields!");
        }

        setCreatingEvaluator(true);

        try {
            const config = {
                method: "POST",
                url: `${serverURL}/evaluate/evaluators/update`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                data: {
                    evaluatorId: evaluators[selectedEvaluator]?._id,
                    title: editEvaluatorTitle,
                    classId: editEvaluatorClassId,
                },
            };

            await axios(config);
            toast.success("Evaluator saved!");
            setEditEvaluatorTitle("");
            setEditEvaluatorClassId("-1");
            await getEvaluators();
        } catch (error) {
            console.error("Error editing evaluator:", error);
            toast.error("Something went wrong!");
        } finally {
            setCreatingEvaluator(false);
        }
    };

    const convertPDFToImage = async (file: any) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const config = {
                method: "POST",
                url: `${serverURL}/pdfimg/convert-pdf`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                data: formData,
            };

            console.log(Array.from(formData.entries()));

            // Send the request to convert the PDF
            const response = await axios(config);

            console.log("Response from converted PDF to Image:");
            console.log(response.data);

            // Convert the response to File array
            const files = response.data.map((fileData: any, index: number) => {
                // Convert the object to a Uint8Array
                const byteArray = new Uint8Array(Object.values(fileData));

                // Create a Blob from the Uint8Array
                const blob = new Blob([byteArray], { type: "image/png" }); // Assuming the images are PNGs

                // Create a File object from the Blob
                return new File([blob], `converted_image_${index + 1}.png`, { type: "image/png" });
            });

            return files; // Return the array of File objects
        } catch (error) {
            console.error("Error converting PDF to images:", error);
            toast.error("Failed to convert PDF to images.");
            return []; // Return an empty array in case of error
        }
    };


    // Function to create a new evaluator
    const createEvaluator = async () => {
        if (
            newEvaluatorClassId === "-1" ||
            newEvaluatorTitle === "" ||
            newEvaluatorQuestionPapers.length === 0 ||
            newEvaluatorAnswerKeys.length === 0
        ) {
            return toast.error("Please fill all the fields!");
        }

        setCreatingEvaluator(true);

        try {
            const config = {
                method: "POST",
                url: `${serverURL}/evaluate/evaluators/create`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                data: {
                    title: newEvaluatorTitle,
                    classId: newEvaluatorClassId,
                    questionPapers: newEvaluatorQuestionPapers,
                    answerKeys: newEvaluatorAnswerKeys,
                },
            };

            await axios(config);
            toast.success("Evaluator Created!");
            setNewEvaluatorTitle("");
            setNewEvaluatorQuestionPapers([]);
            setNewEvaluatorAnswerKeys([]);
            setSelectedEvaluator(0);
            await getEvaluators();
            window.location.href = "/home/evaluators";
        } catch (error) {
            console.error("Error creating evaluator:", error);
            toast.error("Something went wrong!");
        } finally {
            setCreatingEvaluator(false);
        }
    };

    // Function to delete an evaluator
    const deleteEvaluator = async () => {
        try {
            const config = {
                method: "POST",
                url: `${serverURL}/evaluate/evaluators/delete`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                data: {
                    evaluatorId: evaluators[selectedEvaluator]?._id,
                },
            };

            await axios(config);
            await getEvaluators();
            toast.success("Evaluator deleted!");
            window.location.href = "/home";
        } catch (error) {
            console.error("Error deleting evaluator:", error);
            toast.error("Failed to delete evaluator");
        }
    };

    // Function to create a new class
    const createClass = async () => {
        if (newClassName === "" || newClassSection === "" || newClassSubject === "") {
            return toast.error("Please fill all the fields!");
        }

        setCreatingClass(true);

        try {
            const config = {
                method: "POST",
                url: `${serverURL}/class/create`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                data: {
                    name: newClassName,
                    section: newClassSection,
                    subject: newClassSubject,
                },
            };

            await axios(config);
            toast.success("Class Created!");
            setNewClassName("");
            setNewClassSection("");
            setNewClassSubject("");
            setSelectedClass(0);
            await getClasses();
        } catch (error) {
            console.error("Error creating class:", error);
            toast.error("Something went wrong!");
        } finally {
            setCreatingClass(false);
        }
    };

    // Function to edit an existing class
    const editClass = async () => {
        if (editClassName === "" || editClassSection === "" || editClassSubject === "") {
            return toast.error("Please fill all the fields!");
        }

        setCreatingClass(true);

        try {
            const config = {
                method: "POST",
                url: `${serverURL}/class/update`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                data: {
                    classId: classes[selectedClass]._id,
                    name: editClassName,
                    section: editClassSection,
                    subject: editClassSubject,
                },
            };

            await axios(config);
            toast.success("Class Saved!");
            setEditClassName("");
            setEditClassSection("");
            setEditClassSubject("");
            await getClasses();
        } catch (error) {
            console.error("Error editing class:", error);
            toast.error("Failed to save class!");
        } finally {
            setCreatingClass(false);
        }
    };

    // Function to delete a class
    const deleteClass = async () => {
        try {
            const config = {
                method: "POST",
                url: `${serverURL}/class/delete`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                data: {
                    classId: classes[selectedClass]?._id,
                },
            };

            await axios(config);
            await getClasses();
            setSelectedClass(-1);
            toast.success("Class deleted!");
        } catch (error) {
            console.error("Error deleting class:", error);
            toast.error("Failed to delete class");
        }
    };

    // Function to fetch students for a class
    const getStudents = async (classId?: string) => {
        try {
            if (!classId && !classes[selectedClass]?._id) return;

            const config = {
                method: "POST",
                url: `${serverURL}/class/students`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                data: {
                    classId: classId ?? classes[selectedClass]?._id,
                },
            };

            const response = await axios(config);
            setStudents(response.data);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to fetch students.");
        }
    };

    // Function to add a new student
    const addStudent = async () => {
        if (newStudentName === "") {
            return toast.error("Please fill all the fields!");
        }

        setAddingStudent(true);

        try {
            const config = {
                method: "POST",
                url: `${serverURL}/class/add-student`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                data: {
                    classId: classes[selectedClass]._id,
                    name: newStudentName,
                    rollNo: newStudentRollNo,
                },
            };

            await axios(config);
            toast.success("Student added!");
            setNewStudentName("");
            setNewStudentRollNo(0);
            await getStudents();
        } catch (error: any) {
            console.error("Error adding student:", error);
            toast.error(error.response?.data || "Failed to add student.");
        } finally {
            setAddingStudent(false);
        }
    };

    // upload .csv file to add students
    const handleStudentFileChange = async (e: any) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("students", file);
        formData.append("classId", classes[selectedClass]._id);

        try {
            const config = {
                method: "POST",
                url: `${serverURL}/class/import-students`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                data: formData,
            };

            console.log(Array.from(formData.entries()));

            await axios(config);
            toast.success("Students added!");
            await getStudents();
        } catch (error: any) {
            toast.error("Failed to add students.");
        }
    };


    // Function to edit an existing student
    const editStudent = async () => {
        if (editStudentName === "") {
            return toast.error("Please fill all the fields!");
        }

        setAddingStudent(true);

        try {
            const config = {
                method: "POST",
                url: `${serverURL}/class/students/update`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                data: {
                    classId: classes[selectedClass]._id,
                    rollNo: editStudentRollNo,
                    name: editStudentName,
                },
            };

            await axios(config);
            toast.success("Student saved!");
            setEditStudentName("");
            setEditStudentRollNo(-1);
            await getStudents();
        } catch (error: any) {
            console.error("Error editing student:", error);
            toast.error(error.response?.data || "Failed to save student.");
        } finally {
            setAddingStudent(false);
        }
    };

    // Function to delete a student
    const deleteStudent = async () => {
        setAddingStudent(true);

        try {
            const config = {
                method: "POST",
                url: `${serverURL}/class/students/delete`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                data: {
                    classId: classes[selectedClass]._id,
                    rollNo: deleteStudentRollNo,
                },
            };

            await axios(config);
            toast.success("Student deleted!");
            setNewStudentName("");
            setNewStudentRollNo(0);
            setDeleteStudentRollNo(-1);
            await getStudents();
        } catch (error: any) {
            console.error("Error deleting student:", error);
            toast.error(error.response?.data || "Failed to delete student.");
        } finally {
            setAddingStudent(false);
        }
    };

    // Function to fetch evaluation data
    const getEvaluation = async (evaluatorId?: string) => {
        try {
            if (!evaluators[selectedEvaluator]?._id && !evaluatorId) return;

            const config = {
                method: "POST",
                url: `${serverURL}/evaluate/evaluations/get`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                data: {
                    evaluatorId: evaluators[selectedEvaluator]?._id ?? evaluatorId,
                },
            };

            const response = await axios(config);
            const data = response.data.answerSheets ?? [];
            setAnswerSheets([...data]);
            setEvaluationData(response.data.data ?? {});
        } catch (error) {
            console.error("Error fetching evaluation:", error);
            toast.error("Failed to fetch evaluation data.");
        }
    };

    // Function to update evaluation data
    const updateEvaluation = async (evaluatorId: string, answerSheets: any) => {
        if (!evaluatorId) return;

        try {
            const config = {
                method: "POST",
                url: `${serverURL}/evaluate/evaluations/update`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                data: {
                    evaluatorId: evaluatorId,
                    answerSheets: answerSheets,
                },
            };

            await axios(config);
        } catch (error) {
            console.error("Error updating evaluation:", error);
            toast.error("Failed to update evaluation.");
        }
    };

    // Function to evaluate a student
    const evaluate = async (rollNo: number, prompt: string) => {
        const config = {
            method: "POST",
            url: `${serverURL}/evaluate/evaluators/evaluate`,
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            data: {
                evaluatorId: evaluators[selectedEvaluator]?._id,
                rollNo: rollNo,
                prompt: prompt,
            },
        };

        try {
            const response = await axios(config);
            await getLimits();
            return response.data;
        } catch (err: any) {
            console.error("Error evaluating student:", err);
            if (err.response?.status === 500) {
                return -3;
            }
            if (err.response?.data === "Evaluation limit exceeded") {
                return -2;
            }
            return -1;
        }
    };

    // Function to initialize and handle EventSource for evaluation progress
    const getEvaluationProgressSSE = (evaluatorId: string) => {
        if (!evaluatorId) {
            console.error("Evaluator ID is required for real-time updates.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            console.error("Authorization token is missing.");
            return;
        }

        // Close any existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            console.log("Existing EventSource connection closed.");
        }

        // Initialize new EventSource and assign it to the ref
        eventSourceRef.current = new EventSource(
            `${serverURL}/evaluate/evaluation-progress?evaluatorId=${evaluatorId}&token=${token}`
        );

        // Handle incoming messages
        eventSourceRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (Array.isArray(data)) {
                    setEvaluationProgress((prevProgress) => [...data]);
                }

                for (const progress of data) {
                    if (!progress.finished) {
                        setOngoingEvaluation({
                            evaluatorId: evaluatorId,
                        });
                    }
                }
            } catch (error) {
                console.error("Error parsing EventSource data:", error);
            }
        };

        // Handle errors and connection closure
        eventSourceRef.current.onerror = (error) => {
            console.log("END HERE");

            console.log(ongoingEvaluation);

            if (ongoingEvaluation.evaluatorId !== "") {
                setOngoingEvaluation({
                    evaluatorId: "",
                });
                toast.success("Evaluation completed!");

                if (!pathname.includes("results")) {
                    window.location.href = "/results/" + evaluators[selectedEvaluator]?._id;
                }
            }

            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    };

    // Function to fetch results for a specific evaluator and roll number
    const getResults = async (evaluatorId?: string, rollNo?: number) => {
        if (!evaluatorId) return;

        try {
            const config = {
                method: "POST",
                url: `${serverURL}/evaluate/evaluations/results`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                data: {
                    evaluatorId: evaluatorId,
                    rollNo: rollNo,
                },
            };

            const response = await axios(config);
            setResultData(response.data);
        } catch (error) {
            console.error("Error fetching results:", error);
            toast.error("Failed to fetch results.");
        }
    };

    // Function to fetch results table for a specific evaluator
    const getResultsTable = async (evaluatorId?: string) => {
        if (!evaluatorId) return;

        try {
            const config = {
                method: "POST",
                url: `${serverURL}/evaluate/evaluations/results/all`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                data: {
                    evaluatorId: evaluatorId,
                },
            };

            const response = await axios(config);
            setResultDataTable(response.data);
        } catch (error) {
            console.error("Error fetching results table:", error);
            toast.error("Failed to fetch results table.");
        }
    };

    // Function to delete an evaluation
    const deleteEvaluation = async (evaluatorId?: string) => {
        if (!evaluatorId) return;

        try {
            const config = {
                method: "POST",
                url: `${serverURL}/evaluate/evaluations/delete`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                data: {
                    evaluatorId: evaluatorId,
                },
            };

            await axios(config);
            await getEvaluation();
        } catch (error) {
            console.error("Error deleting evaluation:", error);
            toast.error("Failed to delete evaluation.");
        }
    };

    // Function to save a result
    const saveResult = async (evaluatorId: string, rollNo: number, resultData: any) => {
        try {
            const config = {
                method: "POST",
                url: `${serverURL}/evaluate/evaluations/results/save`,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                data: {
                    evaluatorId: evaluatorId,
                    rollNo: rollNo,
                    results: resultData,
                },
            };

            await axios(config);
            toast.success("Result saved!");
            await getResults(evaluatorId, rollNo);
        } catch (error) {
            console.error("Error saving result:", error);
            toast.error("Failed to save result.");
        }
    };

    // useEffect to log evaluationProgress updates
    useEffect(() => {
        console.log("Evaluation progress updated:", evaluationProgress.length);
    }, [evaluationProgress]);

    // useEffect for cleaning up EventSource on component unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
                console.log("EventSource connection closed on cleanup.");
            }
        };
    }, []);

    return (
        <MainContext.Provider
            value={{
                // Main Home
                moreMenuOpen,
                setMoreMenuOpen,
                showMenu,
                setShowMenu,
                user,
                setUser,
                loading,
                setLoading,
                selectedTab,
                setSelectedTab,
                limits,

                // Evaluators Page
                evaluators,
                setEvaluators,
                selectedEvaluator,
                setSelectedEvaluator,
                newEvaluatorTitle,
                setNewEvaluatorTitle,
                loadingEvaluator,
                setLoadingEvaluator,
                creatingEvaluator,
                setCreatingEvaluator,
                newEvaluatorQuestionPapers,
                setNewEvaluatorQuestionPapers,
                newEvaluatorAnswerKeys,
                setNewEvaluatorAnswerKeys,
                newEvaluatorClassId,
                setNewEvaluatorClassId,
                editEvaluatorTitle,
                setEditEvaluatorTitle,
                editEvaluatorClassId,
                setEditEvaluatorClassId,
                answerSheets,
                setAnswerSheets,
                evaluationData,
                setEvaluationData,
                evaluationProgress,
                setEvaluationProgress,
                ongoingEvaluation,
                setOngoingEvaluation,
                convertPDFToImage,
                // Classes Page
                classes,
                setClasses,
                selectedClass,
                setSelectedClass,
                newClassName,
                setNewClassName,
                newClassSection,
                setNewClassSection,
                newClassSubject,
                setNewClassSubject,
                loadingClass,
                setLoadingClass,
                creatingClass,
                setCreatingClass,
                editClassName,
                setEditClassName,
                editClassSection,
                setEditClassSection,
                editClassSubject,
                setEditClassSubject,
                students,
                setStudents,
                newStudentName,
                setNewStudentName,
                newStudentRollNo,
                setNewStudentRollNo,
                addingStudent,
                setAddingStudent,
                deleteStudentRollNo,
                setDeleteStudentRollNo,
                setEditStudentName,
                editStudentName,
                setEditStudentRollNo,
                editStudentRollNo,

                // Results Page
                resultData,
                setResultData,
                resultDataTable,
                setResultDataTable,
                imgPreviewURL,
                setImgPreviewURL,

                // Functions
                getLimits,
                getEvaluators,
                getClasses,
                editEvaluator,
                createEvaluator,
                deleteEvaluator,
                createClass,
                editClass,
                deleteClass,
                getStudents,
                addStudent,
                handleStudentFileChange,
                editStudent,
                deleteStudent,
                getEvaluation,
                updateEvaluation,
                evaluate,
                getResults,
                getResultsTable,
                deleteEvaluation,
                saveResult,

                // EventSource
                getEvaluationProgressSSE,
            }}
        >
            {children}
        </MainContext.Provider>
    );
}

export { MainContext, Context };
