const express = require("express");

const {
    researchCompany
} = require("../services/companyService");

const {
    generateCompanyBrief
} = require("../services/companyBriefService");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/research", authMiddleware, async (req, res) => {
    try {
        const { company_url } = req.body;

        if (!company_url || !company_url.trim()) {
            return res.status(400).json({
                success: false,
                message: "Company URL is required"
            });
        }

        // Research company website
        const result = await researchCompany(
            company_url.trim()
        );

        // Generate AI company brief
        const companyBrief = await generateCompanyBrief(
            result.pages
        );

        res.status(200).json({
            success: true,
            data: {
                ...result,
                company_brief: companyBrief
            }
        });

    } catch (error) {
        console.error(
            "Company research error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to research company website"
        });
    }
});

module.exports = router;