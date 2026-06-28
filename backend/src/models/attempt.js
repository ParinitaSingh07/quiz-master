const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },

        answers: [
            {
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                    required: true,
                },
                selectedAnswer: {
                    type: String,
                    required: true,
                },
                correctAnswer: {
                    type: String,
                    required: true,
                },
                isCorrect: {
                    type: Boolean,
                    required: true,
                },
                marksAwarded: {
                    type: Number,
                    default: 0,
                },
            },
        ],

        score: {
            type: Number,
            required: true,
        },

        totalMarks: {
            type: Number,
            required: true,
        },

        percentage: {
            type: Number,
            required: true,
        },

        correctCount: {
            type: Number,
            required: true,
        },

        incorrectCount: {
            type: Number,
            required: true,
        },

        timeTaken: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Attempt", attemptSchema);