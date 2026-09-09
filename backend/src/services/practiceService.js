const Kit = require("../models/Kit");


// Get flashcards for practice
const getPracticeFlashcards = async (kitId, userId) => {

    const kit = await Kit.findOne({
        _id: kitId,
        userId: userId
    });

    if (!kit) {
        throw new Error("Interview kit not found");
    }

    const flashcards = [...kit.flashcards];


    // Low confidence cards should come first
    // Unrated cards (null) should come after rated cards
    flashcards.sort((a, b) => {

        const confidenceA = a.practice?.confidence;
        const confidenceB = b.practice?.confidence;


        // A is unrated, B is rated
        if (confidenceA === null && confidenceB !== null) {
            return 1;
        }


        // A is rated, B is unrated
        if (confidenceA !== null && confidenceB === null) {
            return -1;
        }


        // Both are unrated
        if (confidenceA === null && confidenceB === null) {
            return 0;
        }


        // Both have confidence
        return confidenceA - confidenceB;
    });


    return flashcards;
};


// Save practice result
const updateFlashcardPractice = async (
    kitId,
    userId,
    flashcardId,
    confidence
) => {

    if (
        !Number.isInteger(confidence) ||
        confidence < 1 ||
        confidence > 5
    ) {
        throw new Error(
            "Confidence must be between 1 and 5"
        );
    }


    const kit = await Kit.findOne({
        _id: kitId,
        userId: userId
    });


    if (!kit) {
        throw new Error("Interview kit not found");
    }


    const flashcard = kit.flashcards.find(
        (card) => card.id === flashcardId
    );


    if (!flashcard) {
        throw new Error("Flashcard not found");
    }


    flashcard.practice.confidence = confidence;
    flashcard.practice.covered = true;


    await kit.save();


    return flashcard;
};


module.exports = {
    getPracticeFlashcards,
    updateFlashcardPractice
};