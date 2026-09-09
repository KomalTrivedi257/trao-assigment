const mongoose = require("mongoose");

const kitSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        source: {
            company: String,
            company_url: String,
            role: String,
            location: String,
            jd_chars: Number,
            researched_at: String,
            pages_used: [String]
        },

        company_brief: {
            summary: String,
            what_they_do: String,
            sources: [String]
        },

        role: {
            title: String,
            seniority: String,
            responsibilities: [String],

            requirements: [
                {
                    id: String,
                    text: String,
                    kind: {
                        type: String,
                        enum: ["technical", "behavioural", "domain"]
                    },
                    priority: {
                        type: String,
                        enum: ["must", "nice"]
                    }
                }
            ]
        },

        questions: [
            {
                id: String,
                requirement_ids: [String],

                category: {
                    type: String,
                    enum: [
                        "technical",
                        "behavioural",
                        "system-design",
                        "company-fit"
                    ]
                },

                prompt: String,
                answer_outline: String,

                difficulty: {
                    type: Number,
                    min: 1,
                    max: 3
                },

                state: {
                    generated: {
                        type: Boolean,
                        default: true
                    },

                    edited: {
                        type: Boolean,
                        default: false
                    },

                    pinned: {
                        type: Boolean,
                        default: false
                    }
                }
            }
        ],

        flashcards: [
            {
                id: String,
                front: String,
                back: String,
                requirement_ids: [String],

                practice: {
                    confidence: {
                        type: Number,
                        min: 1,
                        max: 5,
                        default: null
                    },

                    covered: {
                        type: Boolean,
                        default: false
                    }
                }
            }
        ],

        schedule: {
            days_available: Number,

            days: [
                {
                    day: Number,
                    focus: String,
                    question_ids: [String],
                    minutes: Number
                }
            ]
        },

        coverage: {
            uncovered_requirement_ids: [String],
            passes: Number
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Kit", kitSchema);