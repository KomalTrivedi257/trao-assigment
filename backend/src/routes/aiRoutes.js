const express = require("express");
const { generateAIResponse } = require("../services/aiService");

const router = express.Router();

router.get("/test", async (req, res) => {
    try {
        const result = await generateAIResponse(
            "Say hello and tell me that the AI connection is working."
        );

        res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error("AI test error:", error.message);

        res.status(500).json({
            success: false,
            message: "AI connection failed"
        });
    }
});

module.exports = router;