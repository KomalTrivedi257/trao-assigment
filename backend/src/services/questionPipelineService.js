const {
    generateQuestions,
    generateQuestionsForMissingRequirements
} = require("./questionGenerationService");

const {
    checkCoverage
} = require("./coverageService");


const generateQuestionPipeline = async (
    requirements,
    companyBrief
) => {

    // -----------------------------
    // FIRST PASS
    // -----------------------------

    const firstQuestions = await generateQuestions(
        requirements,
        companyBrief
    );


    // -----------------------------
    // FIRST COVERAGE CHECK
    // -----------------------------

    const firstCoverage = checkCoverage(
        requirements,
        firstQuestions
    );


    let allQuestions = [...firstQuestions];

    let passes = 1;


    // -----------------------------
    // SECOND PASS
    // -----------------------------

    if (
        firstCoverage.uncovered_requirement_ids.length > 0
    ) {

        passes = 2;


        const missingQuestions =
            await generateQuestionsForMissingRequirements(
                requirements,
                companyBrief,
                firstCoverage.uncovered_requirement_ids
            );


        allQuestions = [
            ...allQuestions,
            ...missingQuestions
        ];
    }


    // -----------------------------
    // FINAL COVERAGE CHECK
    // -----------------------------

    const finalCoverage = checkCoverage(
        requirements,
        allQuestions
    );


    // -----------------------------
    // ADD STABLE QUESTION IDS
    // -----------------------------

    const questionsWithIds =
        allQuestions.map(
            (question, index) => {

                return {
                    id: `q${index + 1}`,

                    requirement_ids:
                        Array.isArray(
                            question.requirement_ids
                        )
                            ? question.requirement_ids
                            : [],

                    category:
                        question.category ||
                        "technical",

                    prompt:
                        question.prompt ||
                        "",

                    answer_outline:
                        question.answer_outline ||
                        "",

                    difficulty:
                        Number.isInteger(
                            question.difficulty
                        )
                            ? question.difficulty
                            : 1,

                    state: {
                        generated: true,
                        edited: false,
                        pinned: false
                    }
                };
            }
        );


    // -----------------------------
    // RETURN FINAL PIPELINE RESULT
    // -----------------------------

    return {

        questions: questionsWithIds,

        coverage: {

            covered_requirement_ids:
                finalCoverage.covered_requirement_ids,

            uncovered_requirement_ids:
                finalCoverage.uncovered_requirement_ids,

            passes: passes

        }

    };
};


module.exports = {
    generateQuestionPipeline
};