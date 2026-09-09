const {
    generateAIResponse
} = require("./aiService");


const extractRequirements = async (jd) => {

    if (!jd || !jd.trim()) {
        throw new Error("Job description is required");
    }


    const prompt = `
You are an interview preparation assistant.

Analyze the following job description and extract the important role information.

Return ONLY valid JSON.
Do not add markdown.
Do not add explanations outside JSON.

Required JSON structure:

{
    "title": "",
    "seniority": "",
    "responsibilities": [],
    "requirements": [
        {
            "id": "r1",
            "text": "",
            "kind": "technical",
            "priority": "must"
        }
    ]
}

Rules:
- kind must be one of: technical, behavioural, domain
- priority must be one of: must, nice
- Give every requirement a unique id such as r1, r2, r3
- Include important technical skills, experience, tools and domain knowledge
- Include important behavioural requirements
- Do not invent requirements that are not supported by the JD
- Keep responsibilities concise

Job Description:

${jd}
`;


    const result = await generateAIResponse(prompt);


    let data;

    try {
        data = JSON.parse(result);
    } catch (error) {
        throw new Error("AI returned invalid JSON");
    }


    return data;
};


module.exports = {
    extractRequirements
};