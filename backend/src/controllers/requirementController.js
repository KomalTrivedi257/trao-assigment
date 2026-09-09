const {
    extractRequirements
} = require("../services/requirementService");


const extractRequirementsController = async (req, res) => {

    try {

        const { jd } = req.body;


        if (!jd || !jd.trim()) {
            return res.status(400).json({
                success: false,
                message: "Job description is required"
            });
        }


        const data = await extractRequirements(jd);


        res.status(200).json({
            success: true,
            data
        });


    } catch (error) {

        console.error(
            "Requirement extraction error:",
            error.message
        );


        if (error.message === "AI returned invalid JSON") {
            return res.status(500).json({
                success: false,
                message: "AI returned invalid JSON"
            });
        }


        res.status(500).json({
            success: false,
            message: "Failed to extract requirements"
        });
    }
};


module.exports = {
    extractRequirements: extractRequirementsController
};