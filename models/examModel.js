const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        grade: { type: String },
        subject: { type: String, required: true },
        listOfQuestion: [{ type: mongoose.Types.ObjectId, ref: "question" }],
        time: { type: Number, required: true, default: 15 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("exam", examSchema);
