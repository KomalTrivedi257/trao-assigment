const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    generateQuestions
} = require("../services/questionGenerationService");

const {
    generateQuestionPipeline
} = require("../services/questionPipelineService");

const router = express.Router();


// First pass question generation
router.post("/generate", authMiddleware, async (req, res) => {
    try {
        const {
            requirements,
            companyBrief
        } = req.body;

        if (!requirements || !Array.isArray(requirements)) {
            return res.status(400).json({
                success: false,
                message: "Requirements are required"
            });
        }

        if (!companyBrief) {
            return res.status(400).json({
                success: false,
                message: "Company brief is required"
            });
        }

        const questions = await generateQuestions(
            requirements,
            companyBrief
        );

        res.status(200).json({
            success: true,
            data: questions
        });

    } catch (error) {
        console.error(
            "Generate questions error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate questions"
        });
    }
});


// Complete question generation pipeline
router.post("/pipeline", authMiddleware, async (req, res) => {
    try {
        const {
            requirements,
            companyBrief
        } = req.body;

        if (!requirements || !Array.isArray(requirements)) {
            return res.status(400).json({
                success: false,
                message: "Requirements are required"
            });
        }

        if (!companyBrief) {
            return res.status(400).json({
                success: false,
                message: "Company brief is required"
            });
        }

        const result = await generateQuestionPipeline(
            requirements,
            companyBrief
        );

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            "Question pipeline error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate question pipeline"
        });
    }
});


module.exports = router;