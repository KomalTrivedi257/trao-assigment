const {
    extractRequirements
} = require("./requirementService");

const {
    researchCompany
} = require("./companyService");

const {
    generateCompanyBrief
} = require("./companyBriefService");

const {
    generateQuestionPipeline
} = require("./questionPipelineService");

const {
    generateFlashcards
} = require("./flashcardService");

const {
    createSchedule
} = require("./scheduleService");


const generateInterviewKit = async (
    jd,
    companyUrl,
    daysAvailable
) => {

    // Step 1: Extract role and requirements from JD
    const roleData = await extractRequirements(jd);


    // Step 2: Research company website
    const companyResearch = await researchCompany(
        companyUrl
    );


    // Step 3: Generate company brief
    const companyBrief = await generateCompanyBrief(
        companyResearch.pages
    );


    // Step 4: Generate questions and check coverage
    const questionResult = await generateQuestionPipeline(
        roleData.requirements,
        companyBrief
    );


    // Step 5: Generate flashcards
    const flashcardResult = await generateFlashcards(
        roleData.requirements
    );


    // Add stable flashcard IDs
    const flashcards = flashcardResult.map(
        (flashcard, index) => ({
            ...flashcard,
            id: `f${index + 1}`
        })
    );


    // Step 6: Create schedule
    const schedule = createSchedule(
        roleData.requirements,
        questionResult.questions,
        daysAvailable
    );


    // Step 7: Create final interview kit
    const kit = {

        source: {
            company: "",
            company_url: companyUrl,
            role: roleData.title || "",
            location: "",
            jd_chars: jd.length,
            researched_at: new Date().toISOString(),

            pages_used: companyResearch.pages.map(
                (page) => page.url
            )
        },


        company_brief: {
            summary: companyBrief.summary || "",
            what_they_do: companyBrief.what_they_do || "",
            sources: companyBrief.sources || []
        },


        role: {
            title: roleData.title || "",
            seniority: roleData.seniority || "",

            responsibilities:
                roleData.responsibilities || [],

            requirements:
                roleData.requirements || []
        },


        questions: questionResult.questions,


        flashcards: flashcards,


        schedule: schedule,


        coverage: {
            uncovered_requirement_ids:
                questionResult.coverage
                    .uncovered_requirement_ids,

            passes: questionResult.passes
        }
    };


    return kit;
};


module.exports = {
    generateInterviewKit
};