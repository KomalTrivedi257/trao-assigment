const {
    researchCompany
} = require("./companyService");

const {
    generateCompanyBrief
} = require("./companyBriefService");

const {
    generateQuestionsByCategory,
    generateQuestionsForMissingRequirements
} = require("./questionGenerationService");

const {
    checkCoverage
} = require("./coverageService");


// Regenerate company brief
const regenerateCompanyBrief = async (companyUrl) => {

    if (!companyUrl || !companyUrl.trim()) {
        throw new Error("Company URL is required");
    }

    const companyResearch = await researchCompany(
        companyUrl.trim()
    );

    const companyBrief = await generateCompanyBrief(
        companyResearch.pages
    );

    return {
        summary: companyBrief.summary || "",
        what_they_do: companyBrief.what_they_do || "",
        sources: companyBrief.sources || []
    };
};


// Regenerate questions for one category
const regenerateQuestionCategory = async (
    kit,
    category
) => {

    const allowedCategories = [
        "technical",
        "behavioural",
        "system-design",
        "company-fit"
    ];

    if (!allowedCategories.includes(category)) {
        throw new Error("Invalid question category");
    }


    const requirements = kit.role.requirements;

    const existingQuestions = [
        ...kit.questions
    ];


    // Keep questions from other categories
    const otherQuestions =
        existingQuestions.filter(
            (question) =>
                question.category !== category
        );


    // Keep edited and pinned questions
    // from selected category
    const protectedQuestions =
        existingQuestions.filter(
            (question) =>
                question.category === category &&
                (
                    question.state?.edited === true ||
                    question.state?.pinned === true
                )
        );


    // Generate fresh questions
    const newQuestions =
        await generateQuestionsByCategory(
            requirements,
            kit.company_brief,
            category
        );


    // Add id and state
    const generatedQuestions =
        newQuestions.map(
            (question, index) => ({
                ...question,

                id: `q-${Date.now()}-${index}`,

                state: {
                    generated: true,
                    edited: false,
                    pinned: false
                }
            })
        );


    // Combine questions
    let finalQuestions = [
        ...otherQuestions,
        ...protectedQuestions,
        ...generatedQuestions
    ];


    // First coverage check
    let coverage = checkCoverage(
        requirements,
        finalQuestions
    );


    let passes = 1;


    // Generate questions for uncovered requirements
    if (
        coverage.uncovered_requirement_ids.length > 0
    ) {

        const missingQuestions =
            await generateQuestionsForMissingRequirements(
                requirements,
                kit.company_brief,
                coverage.uncovered_requirement_ids
            );


        const generatedMissingQuestions =
            missingQuestions.map(
                (question, index) => ({
                    ...question,

                    id: `q-${Date.now()}-missing-${index}`,

                    state: {
                        generated: true,
                        edited: false,
                        pinned: false
                    }
                })
            );


        finalQuestions = [
            ...finalQuestions,
            ...generatedMissingQuestions
        ];


        // Final coverage check
        coverage = checkCoverage(
            requirements,
            finalQuestions
        );

        passes = 2;
    }


    return {
        questions: finalQuestions,

        coverage: {
            ...coverage,
            passes
        }
    };
};


module.exports = {
    regenerateCompanyBrief,
    regenerateQuestionCategory
};