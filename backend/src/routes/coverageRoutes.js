const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    checkCoverage
} = require("../services/coverageService");

const router = express.Router();

router.post("/check", authMiddleware, (req, res) => {
    try {
        const {
            requirements,
            questions
        } = req.body;

        if (!requirements || !Array.isArray(requirements)) {
            return res.status(400).json({
                success: false,
                message: "Requirements are required"
            });
        }

        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                message: "Questions are required"
            });
        }

        const result = checkCoverage(
            requirements,
            questions
        );

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            "Coverage check error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to check coverage"
        });
    }
});

module.exports = router;