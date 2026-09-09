const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


const generateFlashcards = async (requirements) => {
    try {

        if (!requirements || !Array.isArray(requirements)) {
            throw new Error("Requirements are required");
        }


        const prompt = `
Create interview preparation flashcards from the following job requirements.

Return ONLY valid JSON.
Do not write markdown.
Do not write explanations.
Do not use code blocks.

Rules:

1. Create 1 flashcard for every requirement.
2. Use the exact requirement id provided.
3. Do not create flashcards for unknown requirement ids.
4. The front should be a short interview concept/question.
5. The back should give a short and useful answer.
6. Do not invent technologies or requirements.
7. Keep answers concise and easy to revise.

Requirements:

${JSON.stringify(requirements)}


Your response MUST have exactly this structure:

{
    "flashcards": [
        {
            "front": "What is React?",
            "back": "React is a JavaScript library used to build user interfaces using reusable components.",
            "requirement_ids": ["r1"]
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
                        content: "Create concise interview preparation flashcards and return only valid JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],

                temperature: 0,

                response_format: {
                    type: "json_object"
                }
            });


        const content =
            response.choices[0].message.content;


        console.log("AI Flashcard Response:");
        console.log(content);


        const result = JSON.parse(content);


        if (
            !result.flashcards ||
            !Array.isArray(result.flashcards)
        ) {
            throw new Error(
                "Invalid flashcards format"
            );
        }


        return result.flashcards;


    } catch (error) {

        console.error(
            "Flashcard generation error:",
            error.message
        );

        throw new Error(
            "Failed to generate flashcards"
        );
    }
};


module.exports = {
    generateFlashcards
};