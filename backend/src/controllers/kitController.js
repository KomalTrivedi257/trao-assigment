const Kit = require("../models/Kit");

const {
    generateInterviewKit
} = require("../services/kitGenerationService");

const {
    regenerateCompanyBrief,
    regenerateQuestionCategory
} = require("../services/regenerationService");


// Create a new interview kit
const createKit = async (req, res) => {
    try {

        const kit = await Kit.create({
            userId: req.user.userId,
            ...req.body
        });

        res.status(201).json({
            success: true,
            message: "Interview kit created successfully",
            kit
        });

    } catch (error) {

        console.error(
            "Create kit error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to create interview kit"
        });
    }
};


// Get all kits of logged-in user
const getKits = async (req, res) => {
    try {

        const kits = await Kit.find({
            userId: req.user.userId
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            count: kits.length,
            kits
        });

    } catch (error) {

        console.error(
            "Get kits error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch interview kits"
        });
    }
};


// Get one kit
const getKitById = async (req, res) => {
    try {

        const kit = await Kit.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!kit) {
            return res.status(404).json({
                success: false,
                message: "Interview kit not found"
            });
        }

        res.status(200).json({
            success: true,
            kit
        });

    } catch (error) {

        console.error(
            "Get kit error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch interview kit"
        });
    }
};


// Update a kit
const updateKit = async (req, res) => {
    try {

        console.log("Kit ID:", req.params.id);
        console.log("User ID:", req.user.userId);
        console.log("Body:", req.body);

        const kit = await Kit.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.userId
            },
            {
                $set: req.body
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!kit) {
            return res.status(404).json({
                success: false,
                message: "Interview kit not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Interview kit updated successfully",
            kit
        });

    } catch (error) {

        console.error(
            "Update kit error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Delete a kit
const deleteKit = async (req, res) => {
    try {

        const kit = await Kit.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!kit) {
            return res.status(404).json({
                success: false,
                message: "Interview kit not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Interview kit deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete kit error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete interview kit"
        });
    }
};


// Generate and save complete interview kit
const generateKit = async (req, res) => {
    try {

        const {
            jd,
            company_url,
            days
        } = req.body;


        // Validate JD
        if (!jd || !jd.trim()) {
            return res.status(400).json({
                success: false,
                message: "Job description is required"
            });
        }


        // Validate company URL
        if (!company_url || !company_url.trim()) {
            return res.status(400).json({
                success: false,
                message: "Company URL is required"
            });
        }


        // Validate days
        if (!Number.isInteger(days) || days < 1) {
            return res.status(400).json({
                success: false,
                message: "Days must be at least 1"
            });
        }


        // Generate complete interview kit
        const kitData = await generateInterviewKit(
            jd.trim(),
            company_url.trim(),
            days
        );


        // Save generated kit for logged-in user
        const kit = await Kit.create({
            userId: req.user.userId,
            ...kitData
        });


        res.status(201).json({
            success: true,
            message: "Interview kit generated and saved successfully",
            kit
        });

    } catch (error) {

        console.error(
            "Generate kit error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate interview kit"
        });
    }
};


// Regenerate only company brief
const regenerateBrief = async (req, res) => {
    try {

        // Find kit belonging to logged-in user
        const kit = await Kit.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!kit) {
            return res.status(404).json({
                success: false,
                message: "Interview kit not found"
            });
        }


        // Get company URL from existing kit
        const companyUrl =
            kit.source?.company_url;


        if (!companyUrl) {
            return res.status(400).json({
                success: false,
                message: "Company URL not available"
            });
        }


        // Generate new company brief
        const companyBrief =
            await regenerateCompanyBrief(
                companyUrl
            );


        // Update ONLY company brief
        kit.company_brief = companyBrief;

        await kit.save();


        res.status(200).json({
            success: true,
            message: "Company brief regenerated successfully",
            company_brief: kit.company_brief
        });

    } catch (error) {

        console.error(
            "Regenerate brief error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to regenerate company brief"
        });
    }
};


// Regenerate questions of one category
const regenerateQuestions = async (req, res) => {
    try {

        const { category } = req.body;


        // Validate category
        const allowedCategories = [
            "technical",
            "behavioural",
            "system-design",
            "company-fit"
        ];


        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category is required"
            });
        }


        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid question category"
            });
        }


        // Find kit belonging to logged-in user
        const kit = await Kit.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });


        if (!kit) {
            return res.status(404).json({
                success: false,
                message: "Interview kit not found"
            });
        }


        // Regenerate selected category
        const result =
            await regenerateQuestionCategory(
                kit,
                category
            );


        // Update questions
        kit.questions = result.questions;


        // Update coverage
        kit.coverage = result.coverage;


        await kit.save();


        res.status(200).json({
            success: true,
            message: "Questions regenerated successfully",
            questions: kit.questions,
            coverage: kit.coverage
        });

    } catch (error) {

        console.error(
            "Regenerate questions error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createKit,
    getKits,
    getKitById,
    updateKit,
    deleteKit,
    generateKit,
    regenerateBrief,
    regenerateQuestions
};