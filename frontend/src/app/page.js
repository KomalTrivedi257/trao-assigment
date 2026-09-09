"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KitBuilder from "../components/KitBuilder";
import PracticeMode from "../components/PracticeMode";

export default function Home() {
    const router = useRouter();

    const [jd, setJd] = useState("");
    const [companyUrl, setCompanyUrl] = useState("");
    const [days, setDays] = useState("5");

    const [loading, setLoading] = useState(false);
    const [kitsLoading, setKitsLoading] = useState(true);
    const [briefLoading, setBriefLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [kit, setKit] = useState(null);
    const [kits, setKits] = useState([]);
    const [user, setUser] = useState(null);


    // Check login and load kits
    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!token) {
            router.push("/login");
            return;
        }

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error("User data error:", error);
            }
        }

        fetchKits(token);
    }, [router]);


    // Fetch user's kits
    const fetchKits = async (token) => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/kits",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch kits"
                );
            }

            setKits(data.kits || []);

        } catch (error) {
            console.error("Fetch kits error:", error);

            setMessage(
                error.message || "Failed to load interview kits"
            );

        } finally {
            setKitsLoading(false);
        }
    };


    // Logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.push("/login");
    };


    // Generate new interview kit
    const generateKit = async () => {

        if (!jd.trim()) {
            setMessage("Please enter job description");
            return;
        }

        if (!companyUrl.trim()) {
            setMessage("Please enter company URL");
            return;
        }


        let validUrl;

        try {
            validUrl = new URL(companyUrl.trim());
        } catch (error) {
            setMessage("Please enter a valid company URL");
            return;
        }


        if (
            validUrl.protocol !== "http:" &&
            validUrl.protocol !== "https:"
        ) {
            setMessage(
                "Company URL must use http or https"
            );
            return;
        }


        const numberOfDays = Number(days);

        if (
            !Number.isInteger(numberOfDays) ||
            numberOfDays < 1 ||
            numberOfDays > 60
        ) {
            setMessage(
                "Days must be between 1 and 60"
            );
            return;
        }


        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }


        try {
            setLoading(true);
            setMessage(
                "Generating your interview kit..."
            );


            const response = await fetch(
                "http://localhost:5000/api/kits/generate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        jd: jd.trim(),
                        company_url: validUrl.toString(),
                        days: numberOfDays
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to generate kit"
                );
            }


            if (!data.kit) {
                throw new Error(
                    "Interview kit was not returned"
                );
            }


            setKit(data.kit);

            setMessage(
                "Interview kit generated successfully!"
            );


            await fetchKits(token);

        } catch (error) {
            console.error(
                "Generate kit error:",
                error
            );

            setMessage(
                error.message ||
                "Something went wrong"
            );

        } finally {
            setLoading(false);
        }
    };


    // Open existing kit
    const openKit = async (kitId) => {

        const token = localStorage.getItem("token");


        if (!token) {
            router.push("/login");
            return;
        }


        if (!kitId) {
            setMessage("Kit ID is missing");
            return;
        }


        try {
            setMessage("Opening interview kit...");


            const response = await fetch(
                `http://localhost:5000/api/kits/${kitId}`,
                {
                    method: "GET",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            const data = await response.json();


            console.log(
                "Open kit response:",
                data
            );


            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to open kit"
                );
            }


            if (!data.kit) {
                throw new Error(
                    "Kit data not found"
                );
            }


            setKit(data.kit);

            setMessage("");


            setTimeout(() => {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth"
                });
            }, 100);


        } catch (error) {

            console.error(
                "Open kit error:",
                error
            );


            setMessage(
                error.message ||
                "Failed to open kit"
            );
        }
    };


    // Regenerate company brief
    const regenerateBrief = async () => {

        const token = localStorage.getItem("token");


        if (!token) {
            router.push("/login");
            return;
        }


        if (!kit?._id) {
            setMessage("Kit ID is missing");
            return;
        }


        try {
            setBriefLoading(true);

            setMessage(
                "Regenerating company brief..."
            );


            const response = await fetch(
                `http://localhost:5000/api/kits/${kit._id}/regenerate-brief`,
                {
                    method: "PUT",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            const data = await response.json();


            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to regenerate company brief"
                );
            }


            setKit((previousKit) => ({
                ...previousKit,
                company_brief: data.company_brief
            }));


            setMessage(
                "Company brief regenerated successfully!"
            );


        } catch (error) {

            console.error(
                "Regenerate brief error:",
                error
            );


            setMessage(
                error.message ||
                "Failed to regenerate company brief"
            );


        } finally {
            setBriefLoading(false);
        }
    };


    return (
        <main className="min-h-screen bg-gray-50 p-6">

            <div className="mx-auto max-w-5xl">


                {/* Header */}

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h1 className="text-3xl font-bold text-gray-900">
                            AI Interview Prep Kit
                        </h1>

                        <p className="mt-1 text-gray-600">
                            Prepare smarter for your next interview.
                        </p>

                    </div>


                    <div className="flex items-center gap-4">

                        {user && (
                            <span className="font-medium text-gray-700">
                                Hi, {user.name}
                            </span>
                        )}


                        <button
                            type="button"
                            onClick={logout}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Logout
                        </button>

                    </div>

                </div>



                {/* My Interview Kits */}

                <div className="mb-8 rounded-xl bg-white p-6 shadow">

                    <div className="mb-5 flex items-center justify-between">

                        <div>

                            <h2 className="text-xl font-semibold text-gray-900">
                                My Interview Kits
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Your previously generated interview kits
                            </p>

                        </div>


                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                            {kits.length} kits
                        </span>

                    </div>



                    {kitsLoading ? (

                        <p className="text-gray-500">
                            Loading your kits...
                        </p>

                    ) : kits.length === 0 ? (

                        <div className="rounded-lg border border-dashed p-6 text-center">

                            <p className="font-medium text-gray-700">
                                No interview kits yet
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Generate your first kit below.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-3">

                            {kits.map((savedKit) => (

                                <div
                                    key={savedKit._id}
                                    className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                                >

                                    <div>

                                        <h3 className="font-medium text-gray-900">
                                            {savedKit.role?.title ||
                                                "Interview Preparation Kit"}
                                        </h3>


                                        <p className="mt-1 text-sm text-gray-500">
                                            {savedKit.source?.company_url ||
                                                "Company website not available"}
                                        </p>


                                        <p className="mt-1 text-xs text-gray-400">
                                            Created{" "}

                                            {savedKit.createdAt
                                                ? new Date(
                                                    savedKit.createdAt
                                                ).toLocaleDateString()
                                                : "Unknown"}
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={() => {
                                            console.log(
                                                "Opening kit:",
                                                savedKit._id
                                            );

                                            openKit(
                                                savedKit._id
                                            );
                                        }}
                                        className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        Open Kit
                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

                </div>



                {/* Create Interview Kit */}

                <div className="rounded-xl bg-white p-6 shadow">

                    <h2 className="mb-5 text-xl font-semibold text-gray-900">
                        Create Interview Kit
                    </h2>



                    {/* Job Description */}

                    <div className="mb-5">

                        <label className="mb-2 block font-medium text-gray-900">
                            Job Description
                        </label>


                        <textarea
                            value={jd}
                            onChange={(e) =>
                                setJd(e.target.value)
                            }
                            placeholder="Paste the job description here..."
                            rows={8}
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                    </div>



                    {/* Company Website */}

                    <div className="mb-5">

                        <label className="mb-2 block font-medium text-gray-900">
                            Company Website
                        </label>


                        <input
                            type="url"
                            value={companyUrl}
                            onChange={(e) =>
                                setCompanyUrl(e.target.value)
                            }
                            placeholder="https://www.microsoft.com"
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                    </div>



                    {/* Days */}

                    <div className="mb-6">

                        <label className="mb-2 block font-medium text-gray-900">
                            Days Until Interview
                        </label>


                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={days}
                            onChange={(e) =>
                                setDays(e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />


                        <p className="mt-1 text-xs text-gray-500">
                            Enter between 1 and 60 days.
                        </p>

                    </div>



                    {/* Generate Button */}

                    <button
                        type="button"
                        onClick={generateKit}
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {loading
                            ? "Generating..."
                            : "Generate Interview Kit"}
                    </button>


                    {message && (
                        <p className="mt-4 text-sm text-gray-600">
                            {message}
                        </p>
                    )}

                </div>



                {/* Generated / Opened Kit */}

                {kit && (

                    <div className="mt-8 space-y-6">


                        {/* Company Brief */}

                        <div className="rounded-xl bg-white p-6 shadow">

                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Company Brief
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Quick overview based on researched company pages.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={regenerateBrief}
                                    disabled={briefLoading}
                                    className="cursor-pointer rounded-lg border border-blue-300 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {briefLoading
                                        ? "Regenerating..."
                                        : "Regenerate Brief"}
                                </button>

                            </div>



                            <h3 className="mb-2 font-medium text-gray-900">
                                What they do
                            </h3>

                            <p className="mb-5 text-gray-600">
                                {kit.company_brief?.what_they_do ||
                                    "No company information available."}
                            </p>



                            <h3 className="mb-2 font-medium text-gray-900">
                                Summary
                            </h3>

                            <p className="text-gray-600">
                                {kit.company_brief?.summary ||
                                    "No company summary available."}
                            </p>



                            {/* Sources */}

                            {kit.company_brief?.sources?.length > 0 && (

                                <div className="mt-5">

                                    <h3 className="mb-2 font-medium text-gray-900">
                                        Research Sources
                                    </h3>


                                    <div className="space-y-1">

                                        {kit.company_brief.sources.map(
                                            (source, index) => (

                                                <a
                                                    key={index}
                                                    href={source}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block break-all text-sm text-blue-600 hover:underline"
                                                >
                                                    {source}
                                                </a>

                                            )
                                        )}

                                    </div>

                                </div>

                            )}

                        </div>



                        {/* Role */}

                        <div className="rounded-xl bg-white p-6 shadow">

                            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                                Role
                            </h2>


                            <p className="mb-2 text-gray-700">
                                <strong>Title:</strong>{" "}
                                {kit.role?.title ||
                                    "Not available"}
                            </p>


                            <p className="mb-4 text-gray-700">
                                <strong>Seniority:</strong>{" "}
                                {kit.role?.seniority ||
                                    "Not available"}
                            </p>


                            <h3 className="mb-3 font-medium text-gray-900">
                                Requirements
                            </h3>


                            <div className="space-y-2">

                                {kit.role?.requirements?.map(
                                    (requirement) => (

                                        <div
                                            key={requirement.id}
                                            className="rounded-lg border border-gray-200 p-3"
                                        >

                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                                                <span className="font-medium text-gray-900">
                                                    {requirement.text}
                                                </span>


                                                <span className="w-fit rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                    {requirement.priority}
                                                </span>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>



                        {/* Questions */}

                        <div className="rounded-xl bg-white p-6 shadow">

                            <div className="mb-4">

                                <h2 className="text-xl font-semibold text-gray-900">
                                    Interview Questions
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Questions generated from your job requirements.
                                </p>

                            </div>


                            <div className="space-y-4">

                                {kit.questions?.map(
                                    (question) => (

                                        <div
                                            key={question.id}
                                            className="rounded-lg border border-gray-200 p-4"
                                        >

                                            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                                <div className="flex items-center gap-2">

                                                    <span className="rounded bg-gray-100 px-2 py-1 text-sm font-medium text-gray-700">
                                                        {question.id}
                                                    </span>


                                                    <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                                                        {question.category}
                                                    </span>

                                                </div>


                                                <span className="text-sm text-gray-500">
                                                    Difficulty:{" "}
                                                    {question.difficulty}
                                                </span>

                                            </div>


                                            <p className="mb-3 text-gray-900">
                                                {question.prompt}
                                            </p>


                                            <p className="text-sm text-gray-600">
                                                <strong>
                                                    Answer:
                                                </strong>{" "}
                                                {question.answer_outline}
                                            </p>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>



                        {/* Flashcards */}

                        <div className="rounded-xl bg-white p-6 shadow">

                            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                                Flashcards
                            </h2>


                            <div className="grid gap-4 md:grid-cols-2">

                                {kit.flashcards?.map(
                                    (flashcard) => (

                                        <div
                                            key={flashcard.id}
                                            className="rounded-lg border border-gray-200 p-4"
                                        >

                                            <span className="mb-3 inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                {flashcard.id}
                                            </span>


                                            <p className="mb-3 font-medium text-gray-900">
                                                {flashcard.front}
                                            </p>


                                            <p className="text-sm text-gray-600">
                                                {flashcard.back}
                                            </p>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>



                        {/* Schedule */}

                        <div className="rounded-xl bg-white p-6 shadow">

                            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                                Study Schedule
                            </h2>


                            <div className="space-y-3">

                                {kit.schedule?.days?.map(
                                    (day) => (

                                        <div
                                            key={day.day}
                                            className="rounded-lg border border-gray-200 p-4"
                                        >

                                            <div className="flex items-center justify-between gap-4">

                                                <strong className="text-gray-900">
                                                    Day {day.day}
                                                </strong>


                                                <span className="text-sm font-medium text-gray-500">
                                                    {day.minutes} minutes
                                                </span>

                                            </div>


                                            <p className="mt-2 text-gray-600">
                                                {day.focus}
                                            </p>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>



                        {/* Kit Builder */}

                        <KitBuilder
                            kit={kit}
                            setKit={setKit}
                        />



                        {/* Practice Mode */}

                        <PracticeMode
                            kitId={kit._id}
                        />

                    </div>

                )}

            </div>

        </main>
    );
}