const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        question: { type: String, required: true },
        answerA: { type: String, required: true },
        answerB: { type: String, required: true },
        answerC: { type: String, required: true },
        answerD: { type: String, required: true },
        correctAnswer: { type: String, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("question", questionSchema);
