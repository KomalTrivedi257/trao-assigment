
const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


const ALLOWED_CATEGORIES = [
    "technical",
    "behavioural",
    "system-design",
    "company-fit"
];


// -------------------------------------
// Validate and clean AI questions
// -------------------------------------

const validateQuestions = (
    questions,
    requirements,
    expectedCategory = null
) => {

    if (!Array.isArray(questions)) {
        throw new Error("AI did not return a questions array");
    }


    const validRequirementIds = new Set(
        requirements.map(
            (requirement) => requirement.id
        )
    );


    const cleanedQuestions = [];


    for (const question of questions) {

        if (!question || typeof question !== "object") {
            continue;
        }


        // Check requirement IDs
        const requirementIds =
            Array.isArray(question.requirement_ids)
                ? question.requirement_ids.filter(
                    (id) =>
                        validRequirementIds.has(id)
                )
                : [];


        // Question must belong to at least one valid requirement
        if (requirementIds.length === 0) {
            continue;
        }


        // Check category
        const category = question.category;


        if (!ALLOWED_CATEGORIES.includes(category)) {
            continue;
        }


        // Category regeneration must use requested category
        if (
            expectedCategory &&
            category !== expectedCategory
        ) {
            continue;
        }


        // Check difficulty
        const difficulty =
            Number(question.difficulty);


        if (
            !Number.isInteger(difficulty) ||
            difficulty < 1 ||
            difficulty > 3
        ) {
            continue;
        }


        // Check prompt
        if (
            typeof question.prompt !== "string" ||
            !question.prompt.trim()
        ) {
            continue;
        }


        // Check answer outline
        if (
            typeof question.answer_outline !== "string" ||
            !question.answer_outline.trim()
        ) {
            continue;
        }


        cleanedQuestions.push({
            requirement_ids: requirementIds,
            category: category,
            prompt: question.prompt.trim(),
            answer_outline: question.answer_outline.trim(),
            difficulty: difficulty
        });
    }


    return cleanedQuestions;
};



// -------------------------------------
// Generate questions - FIRST PASS
// -------------------------------------

const generateQuestions = async (
    requirements,
    companyBrief
) => {

    try {

        const prompt = `
Create interview questions from the following job requirements.

IMPORTANT:
Return ONLY valid JSON.
Do not write markdown.
Do not write explanations.
Do not write code blocks.

The response must be a single JSON object.

Rules:

1. Create exactly 2 questions for EVERY requirement.
2. Every question MUST contain at least one requirement_id.
3. requirement_ids MUST use only the exact IDs provided below.
4. Never invent requirement IDs.
5. The question category should match the requirement.
6. Use "technical" for technical skills.
7. Use "behavioural" for communication, teamwork, collaboration and soft skills.
8. Use "system-design" only when the requirement involves architecture, scalability or system design.
9. Use "company-fit" for company-specific motivation or culture questions.
10. difficulty must be an integer: 1, 2, or 3.
11. prompt must be a realistic interview question.
12. answer_outline must contain useful points that an interviewer expects.
13. Do not include any text before or after the JSON object.

Requirements:

${JSON.stringify(requirements)}

Company brief:

${JSON.stringify(companyBrief)}

Return exactly this JSON structure:

{
    "questions": [
        {
            "requirement_ids": ["r1"],
            "category": "technical",
            "prompt": "Explain your experience with React.",
            "answer_outline": "Discuss components, hooks, state management and practical projects.",
            "difficulty": 2
        }
    ]
}
`;


        const response =
            await groq.chat.completions.create({

                model: "openai/gpt-oss-20b",

                messages: [
                    {
                        role: "system",
                        content:
                            "Return only valid JSON. Do not include markdown or explanations."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],

                temperature: 0
            });


        const content =
            response.choices[0].message.content;


        console.log(
            "AI Question Response:"
        );

        console.log(content);


        let result;

        try {

            result = JSON.parse(content);

        } catch (error) {

            console.error(
                "Question JSON parse error:",
                error.message
            );

            throw new Error(
                "AI returned invalid JSON"
            );
        }


        const questions =
            validateQuestions(
                result.questions,
                requirements
            );


        if (questions.length === 0) {
            throw new Error(
                "AI returned no valid questions"
            );
        }


        return questions;

    } catch (error) {

        console.error(
            "Question generation error:",
            error.message
        );

        throw new Error(
            "Failed to generate interview questions"
        );
    }
};



// -------------------------------------
// Generate questions for missing requirements
// -------------------------------------

const generateQuestionsForMissingRequirements = async (
    requirements,
    companyBrief,
    missingRequirementIds
) => {

    try {

        const missingRequirements =
            requirements.filter(
                (requirement) =>
                    missingRequirementIds.includes(
                        requirement.id
                    )
            );


        if (missingRequirements.length === 0) {
            return [];
        }


        const prompt = `
Create interview questions ONLY for the missing requirements below.

IMPORTANT:
Return ONLY valid JSON.
Do not write markdown.
Do not write explanations.
Do not write code blocks.
Do not write anything before or after the JSON object.

Rules:

1. Create exactly 2 questions for each missing requirement.
2. Every question MUST contain the exact requirement_id.
3. Do not use any requirement ID that is not provided.
4. Match the question category with the requirement.
5. Technical requirements should normally use "technical".
6. Communication/teamwork requirements should normally use "behavioural".
7. System architecture requirements can use "system-design".
8. Company-specific requirements can use "company-fit".
9. difficulty must be 1, 2, or 3.
10. Questions must be realistic interview questions.
11. answer_outline must contain useful answer points.

Missing requirements:

${JSON.stringify(missingRequirements)}

Company brief:

${JSON.stringify(companyBrief)}

Return exactly this JSON structure:

{
    "questions": [
        {
            "requirement_ids": ["r5"],
            "category": "behavioural",
            "prompt": "How do you communicate technical issues with your team?",
            "answer_outline": "Explain the problem clearly, provide context and discuss possible solutions.",
            "difficulty": 2
        }
    ]
}
`;


        const response =
            await groq.chat.completions.create({

                model: "openai/gpt-oss-20b",

                messages: [
                    {
                        role: "system",
                        content:
                            "Return only valid JSON. Do not include markdown or explanations."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],

                temperature: 0
            });


        const content =
            response.choices[0].message.content;


        console.log(
            "AI Missing Questions Response:"
        );

        console.log(content);


        let result;

        try {

            result = JSON.parse(content);

        } catch (error) {

            console.error(
                "Missing question JSON parse error:",
                error.message
            );

            throw new Error(
                "AI returned invalid JSON"
            );
        }


        const questions =
            validateQuestions(
                result.questions,
                missingRequirements
            );


        return questions;

    } catch (error) {

        console.error(
            "Missing question generation error:",
            error.message
        );

        throw new Error(
            "Failed to generate missing questions"
        );
    }
};



// -------------------------------------
// Generate questions for ONE category
// -------------------------------------

const generateQuestionsByCategory = async (
    requirements,
    companyBrief,
    category
) => {

    try {

        if (
            !ALLOWED_CATEGORIES.includes(category)
        ) {
            throw new Error(
                "Invalid question category"
            );
        }


        const prompt = `
Create interview questions ONLY for the "${category}" category.

IMPORTANT:
Return ONLY valid JSON.
Do not write markdown.
Do not write explanations.
Do not write code blocks.
Do not write anything before or after the JSON object.

Rules:

1. Create questions only for the provided requirements.
2. Use only the exact requirement IDs.
3. Never invent requirement IDs.
4. Every question category MUST be "${category}".
5. difficulty must be 1, 2, or 3.
6. Create 2 questions for each requirement.
7. requirement_ids must contain at least one valid requirement ID.
8. prompt must be a realistic interview question.
9. answer_outline must contain useful answer points.

Requirements:

${JSON.stringify(requirements)}

Company brief:

${JSON.stringify(companyBrief)}

Selected category:

${category}

Return exactly this JSON structure:

{
    "questions": [
        {
            "requirement_ids": ["r1"],
            "category": "${category}",
            "prompt": "Question here",
            "answer_outline": "Answer points here",
            "difficulty": 2
        }
    ]
}
`;


        const response =
            await groq.chat.completions.create({

                model: "openai/gpt-oss-20b",

                messages: [
                    {
                        role: "system",
                        content:
                            "Return only valid JSON. Do not include markdown or explanations."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],

                temperature: 0
            });


        const content =
            response.choices[0].message.content;


        console.log(
            "AI Category Question Response:"
        );

        console.log(content);


        let result;

        try {

            result = JSON.parse(content);

        } catch (error) {

            console.error(
                "Category question JSON parse error:",
                error.message
            );

            throw new Error(
                "AI returned invalid JSON"
            );
        }


        const questions =
            validateQuestions(
                result.questions,
                requirements,
                category
            );


        return questions;

    } catch (error) {

        console.error(
            "Category question generation error:",
            error.message
        );

        throw new Error(
            "Failed to generate category questions"
        );
    }
};



module.exports = {
    generateQuestions,
    generateQuestionsForMissingRequirements,
    generateQuestionsByCategory
};

