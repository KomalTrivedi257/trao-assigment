const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    getPracticeFlashcards,
    updateFlashcardPractice
} = require("../services/practiceService");


const router = express.Router();


// Get flashcards for practice
router.get(
    "/:kitId",
    authMiddleware,
    async (req, res) => {

        try {

            const flashcards =
                await getPracticeFlashcards(
                    req.params.kitId,
                    req.user.userId
                );


            res.status(200).json({
                success: true,
                flashcards
            });


        } catch (error) {

            console.error(
                "Get practice flashcards error:",
                error.message
            );


            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


// Update flashcard confidence
router.put(
    "/:kitId/:flashcardId",
    authMiddleware,
    async (req, res) => {

        try {

            const {
                confidence
            } = req.body;


            const flashcard =
                await updateFlashcardPractice(
                    req.params.kitId,
                    req.user.userId,
                    req.params.flashcardId,
                    confidence
                );


            res.status(200).json({
                success: true,
                message: "Practice result saved successfully",
                flashcard
            });


        } catch (error) {

            console.error(
                "Update practice error:",
                error.message
            );


            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
);


module.exports = router;