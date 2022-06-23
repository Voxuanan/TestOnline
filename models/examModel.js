const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        grade: { type: String, default: 12 },
        subject: { type: String, required: true },
        listOfQuestion: [{ type: mongoose.Types.ObjectId, ref: "question" }],
        time: { type: Number, required: true, default: 15 },
        isTHPTQG: { type: Boolean, required: true, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("exam", examSchema);
