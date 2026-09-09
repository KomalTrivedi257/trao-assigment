const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const generateAIResponse = async (prompt) => {
    const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.2
    });

    return response.choices[0].message.content;
};

module.exports = {
    generateAIResponse
};