const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    createSchedule
} = require("../services/scheduleService");

const router = express.Router();


router.post("/create", authMiddleware, (req, res) => {
    try {

        const {
            requirements,
            questions,
            daysAvailable
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


        if (!daysAvailable) {
            return res.status(400).json({
                success: false,
                message: "Days available are required"
            });
        }


        const schedule = createSchedule(
            requirements,
            questions,
            daysAvailable
        );


        res.status(200).json({
            success: true,
            data: schedule
        });

    } catch (error) {

        console.error(
            "Schedule creation error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to create schedule"
        });
    }
});


module.exports = router;