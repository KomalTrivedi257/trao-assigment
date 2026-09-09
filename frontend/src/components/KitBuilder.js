
"use client";

import { useState } from "react";

export default function KitBuilder({ kit, setKit }) {
    const [saving, setSaving] = useState(false);
    const [regenerating, setRegenerating] = useState("");
    const [message, setMessage] = useState("");

    const updateQuestion = (questionId, field, value) => {
        const updatedQuestions = kit.questions.map((question) => {
            if (question.id !== questionId) {
                return question;
            }

            return {
                ...question,
                [field]: value,
                state: {
                    ...question.state,
                    edited: true
                }
            };
        });

        setKit({
            ...kit,
            questions: updatedQuestions
        });
    };

    const togglePin = (questionId) => {
        const updatedQuestions = kit.questions.map((question) => {
            if (question.id !== questionId) {
                return question;
            }

            return {
                ...question,
                state: {
                    ...question.state,
                    pinned: !question.state?.pinned
                }
            };
        });

        setKit({
            ...kit,
            questions: updatedQuestions
        });
    };

    const deleteQuestion = (questionId) => {
        const updatedQuestions = kit.questions.filter(
            (question) => question.id !== questionId
        );

        setKit({
            ...kit,
            questions: updatedQuestions
        });
    };

    const moveQuestion = (index, direction) => {
        const newQuestions = [...kit.questions];
        const newIndex = index + direction;

        if (
            newIndex < 0 ||
            newIndex >= newQuestions.length
        ) {
            return;
        }

        const currentQuestion = newQuestions[index];

        newQuestions[index] = newQuestions[newIndex];
        newQuestions[newIndex] = currentQuestion;

        setKit({
            ...kit,
            questions: newQuestions
        });
    };

    const updateFlashcard = (
        flashcardId,
        field,
        value
    ) => {
        const updatedFlashcards = kit.flashcards.map(
            (flashcard) => {
                if (flashcard.id !== flashcardId) {
                    return flashcard;
                }

                return {
                    ...flashcard,
                    [field]: value
                };
            }
        );

        setKit({
            ...kit,
            flashcards: updatedFlashcards
        });
    };

    const saveChanges = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setMessage("Please login first");
            return;
        }

        try {
            setSaving(true);
            setMessage("");

            const response = await fetch(
                `http://localhost:5000/api/kits/${kit._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        questions: kit.questions,
                        flashcards: kit.flashcards
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to save changes"
                );
            }

            setKit(data.kit);

            setMessage("Changes saved successfully!");

        } catch (error) {
            console.error(error);

            setMessage(
                error.message || "Failed to save changes"
            );

        } finally {
            setSaving(false);
        }
    };

    const regenerateQuestions = async (category) => {
        const token = localStorage.getItem("token");

        if (!token) {
            setMessage("Please login first");
            return;
        }

        try {
            setRegenerating(category);
            setMessage("");

            const response = await fetch(
                `http://localhost:5000/api/kits/${kit._id}/regenerate-questions`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        category
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to regenerate questions"
                );
            }

            setKit({
                ...kit,
                questions: data.questions,
                coverage: data.coverage
            });

            setMessage(
                `${category} questions regenerated successfully!`
            );

        } catch (error) {
            console.error(error);

            setMessage(
                error.message ||
                "Failed to regenerate questions"
            );

        } finally {
            setRegenerating("");
        }
    };

    return (
        <div className="mt-8 space-y-6">

            {/* Builder Header */}

            <div className="rounded-xl bg-white p-6 shadow">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Kit Builder
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Edit and organize your interview preparation.
                        </p>
                    </div>

                    <button
                        onClick={saveChanges}
                        disabled={saving}
                        className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                </div>

                {message && (
                    <p className="mt-4 text-sm text-gray-600">
                        {message}
                    </p>
                )}

            </div>


            {/* Regenerate Questions */}

            <div className="rounded-xl bg-white p-6 shadow">

                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Regenerate Questions
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Regenerate one category without affecting your
                        other question categories.
                    </p>
                </div>


                <div className="flex flex-wrap gap-3">

                    <button
                        onClick={() =>
                            regenerateQuestions("technical")
                        }
                        disabled={regenerating !== ""}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {regenerating === "technical"
                            ? "Regenerating..."
                            : "Regenerate Technical"}
                    </button>


                    <button
                        onClick={() =>
                            regenerateQuestions("behavioural")
                        }
                        disabled={regenerating !== ""}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {regenerating === "behavioural"
                            ? "Regenerating..."
                            : "Regenerate Behavioural"}
                    </button>


                    <button
                        onClick={() =>
                            regenerateQuestions("system-design")
                        }
                        disabled={regenerating !== ""}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {regenerating === "system-design"
                            ? "Regenerating..."
                            : "Regenerate System Design"}
                    </button>


                    <button
                        onClick={() =>
                            regenerateQuestions("company-fit")
                        }
                        disabled={regenerating !== ""}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {regenerating === "company-fit"
                            ? "Regenerating..."
                            : "Regenerate Company Fit"}
                    </button>

                </div>


                {/* Coverage */}

                {kit.coverage && (
                    <div className="mt-5 rounded-lg bg-gray-50 p-4">

                        <p className="text-sm font-medium text-gray-900">
                            Requirement Coverage
                        </p>

                        <div className="mt-2 space-y-1">

                            <p className="text-sm text-gray-600">
                                Covered:{" "}
                                {kit.coverage.covered_requirement_ids?.length || 0}
                            </p>

                            <p className="text-sm text-gray-600">
                                Uncovered:{" "}
                                {kit.coverage.uncovered_requirement_ids?.length || 0}
                            </p>

                            <p className="text-sm text-gray-600">
                                Passes:{" "}
                                {kit.coverage.passes || 1}
                            </p>

                        </div>

                    </div>
                )}

            </div>


            {/* Questions */}

            <div className="rounded-xl bg-white p-6 shadow">

                <h2 className="mb-5 text-xl font-semibold text-gray-900">
                    Edit Questions
                </h2>

                <div className="space-y-5">

                    {kit.questions.map(
                        (question, index) => (

                            <div
                                key={question.id}
                                className="rounded-lg border border-gray-200 p-5"
                            >

                                {/* Question Header */}

                                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <div className="flex flex-wrap items-center gap-2">

                                        <span className="rounded bg-gray-100 px-2 py-1 text-sm font-medium text-gray-700">
                                            {question.id}
                                        </span>

                                        {question.state?.pinned && (
                                            <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                                                Pinned
                                            </span>
                                        )}

                                        {question.state?.edited && (
                                            <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                                Edited
                                            </span>
                                        )}

                                    </div>

                                    <span className="text-sm text-gray-500">
                                        Difficulty:{" "}
                                        {question.difficulty}
                                    </span>

                                </div>


                                {/* Question */}

                                <label className="mb-2 block text-sm font-medium text-gray-900">
                                    Question
                                </label>

                                <textarea
                                    value={question.prompt || ""}
                                    onChange={(e) =>
                                        updateQuestion(
                                            question.id,
                                            "prompt",
                                            e.target.value
                                        )
                                    }
                                    rows={3}
                                    className="mb-4 w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />


                                {/* Answer */}

                                <label className="mb-2 block text-sm font-medium text-gray-900">
                                    Answer Outline
                                </label>

                                <textarea
                                    value={
                                        question.answer_outline || ""
                                    }
                                    onChange={(e) =>
                                        updateQuestion(
                                            question.id,
                                            "answer_outline",
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    className="mb-4 w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />


                                {/* Category */}

                                <label className="mb-2 block text-sm font-medium text-gray-900">
                                    Category
                                </label>

                                <select
                                    value={
                                        question.category ||
                                        "technical"
                                    }
                                    onChange={(e) =>
                                        updateQuestion(
                                            question.id,
                                            "category",
                                            e.target.value
                                        )
                                    }
                                    className="mb-4 rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="technical">
                                        Technical
                                    </option>

                                    <option value="behavioural">
                                        Behavioural
                                    </option>

                                    <option value="system-design">
                                        System Design
                                    </option>

                                    <option value="company-fit">
                                        Company Fit
                                    </option>

                                </select>


                                {/* Actions */}

                                <div className="flex flex-wrap gap-2">

                                    <button
                                        onClick={() =>
                                            moveQuestion(
                                                index,
                                                -1
                                            )
                                        }
                                        disabled={index === 0}
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        ↑ Move Up
                                    </button>

                                    <button
                                        onClick={() =>
                                            moveQuestion(
                                                index,
                                                1
                                            )
                                        }
                                        disabled={
                                            index ===
                                            kit.questions.length - 1
                                        }
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        ↓ Move Down
                                    </button>

                                    <button
                                        onClick={() =>
                                            togglePin(
                                                question.id
                                            )
                                        }
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        {question.state?.pinned
                                            ? "Unpin"
                                            : "Pin"}
                                    </button>

                                    <button
                                        onClick={() =>
                                            deleteQuestion(
                                                question.id
                                            )
                                        }
                                        className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </div>


            {/* Flashcards */}

            <div className="rounded-xl bg-white p-6 shadow">

                <h2 className="mb-5 text-xl font-semibold text-gray-900">
                    Edit Flashcards
                </h2>

                <div className="grid gap-5 md:grid-cols-2">

                    {kit.flashcards.map(
                        (flashcard) => (

                            <div
                                key={flashcard.id}
                                className="rounded-lg border border-gray-200 p-5"
                            >

                                <div className="mb-4">
                                    <span className="rounded bg-gray-100 px-2 py-1 text-sm font-medium text-gray-700">
                                        {flashcard.id}
                                    </span>
                                </div>


                                {/* Front */}

                                <label className="mb-2 block text-sm font-medium text-gray-900">
                                    Front
                                </label>

                                <textarea
                                    value={flashcard.front || ""}
                                    onChange={(e) =>
                                        updateFlashcard(
                                            flashcard.id,
                                            "front",
                                            e.target.value
                                        )
                                    }
                                    rows={3}
                                    className="mb-4 w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />


                                {/* Back */}

                                <label className="mb-2 block text-sm font-medium text-gray-900">
                                    Back
                                </label>

                                <textarea
                                    value={flashcard.back || ""}
                                    onChange={(e) =>
                                        updateFlashcard(
                                            flashcard.id,
                                            "back",
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />

                            </div>

                        )
                    )}

                </div>

            </div>

        </div>
    );
}
