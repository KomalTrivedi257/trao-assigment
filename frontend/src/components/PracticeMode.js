
"use client";

import { useEffect, useState } from "react";

export default function PracticeMode({ kitId }) {
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchFlashcards();
    }, [kitId]);

    const fetchFlashcards = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setMessage("Please login first");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/practice/${kitId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load flashcards"
                );
            }

            setFlashcards(data.flashcards || []);

        } catch (error) {
            console.error(error);

            setMessage(
                error.message || "Failed to load flashcards"
            );

        } finally {
            setLoading(false);
        }
    };

    const saveConfidence = async (confidence) => {
        const token = localStorage.getItem("token");
        const currentCard = flashcards[currentIndex];

        if (!token || !currentCard) {
            return;
        }

        try {
            setSaving(true);
            setMessage("");

            const response = await fetch(
                `http://localhost:5000/api/practice/${kitId}/${currentCard.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        confidence
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to save confidence"
                );
            }

            const updatedCards = flashcards.map((card) => {
                if (card.id !== currentCard.id) {
                    return card;
                }

                return {
                    ...card,
                    practice: {
                        ...card.practice,
                        confidence,
                        covered: true
                    }
                };
            });

            setFlashcards(updatedCards);

            setShowAnswer(false);

            if (currentIndex < flashcards.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setMessage(
                    "Practice completed! 🎉"
                );
            }

        } catch (error) {
            console.error(error);

            setMessage(
                error.message || "Failed to save practice result"
            );

        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-gray-500">
                    Loading practice cards...
                </p>
            </div>
        );
    }

    if (flashcards.length === 0) {
        return (
            <div className="rounded-xl bg-white p-6 shadow">
                <h2 className="text-xl font-semibold text-gray-900">
                    Practice Mode
                </h2>

                <p className="mt-2 text-gray-500">
                    No flashcards available for practice.
                </p>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];

    return (
        <div className="rounded-xl bg-white p-6 shadow">

            <div className="mb-6 flex items-center justify-between">

                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Practice Mode
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Test yourself before revealing the answer.
                    </p>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                    {currentIndex + 1} / {flashcards.length}
                </span>

            </div>


            {/* Flashcard */}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">

                <span className="text-sm font-medium text-gray-500">
                    {currentCard.id}
                </span>

                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {currentCard.front}
                </h3>


                {/* Show Answer */}

                {!showAnswer ? (
                    <button
                        onClick={() => setShowAnswer(true)}
                        className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                    >
                        Show Answer
                    </button>
                ) : (
                    <div className="mt-6">

                        <div className="rounded-lg bg-white p-4">
                            <p className="mb-2 font-medium text-gray-900">
                                Answer
                            </p>

                            <p className="text-gray-600">
                                {currentCard.back}
                            </p>
                        </div>


                        {/* Confidence */}

                        <div className="mt-6">

                            <p className="mb-3 font-medium text-gray-900">
                                How confident are you?
                            </p>

                            <div className="flex flex-wrap gap-2">

                                {[1, 2, 3, 4, 5].map(
                                    (confidence) => (
                                        <button
                                            key={confidence}
                                            onClick={() =>
                                                saveConfidence(
                                                    confidence
                                                )
                                            }
                                            disabled={saving}
                                            className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {confidence}
                                        </button>
                                    )
                                )}

                            </div>

                            <p className="mt-2 text-sm text-gray-500">
                                1 = Need more practice, 5 = Very confident
                            </p>

                        </div>

                    </div>
                )}

            </div>


            {/* Progress */}

            <div className="mt-6">

                <div className="mb-2 flex justify-between text-sm">

                    <span className="text-gray-500">
                        Progress
                    </span>

                    <span className="font-medium text-gray-700">
                        {
                            flashcards.filter(
                                (card) =>
                                    card.practice?.covered
                            ).length
                        }{" "}
                        completed
                    </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-200">

                    <div
                        className="h-full bg-blue-600"
                        style={{
                            width: `${
                                (
                                    flashcards.filter(
                                        (card) =>
                                            card.practice?.covered
                                    ).length /
                                    flashcards.length
                                ) * 100
                            }%`
                        }}
                    />

                </div>

            </div>


            {message && (
                <p className="mt-4 text-sm text-gray-600">
                    {message}
                </p>
            )}

        </div>
    );
}

