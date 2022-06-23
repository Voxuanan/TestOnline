const mongoose = require("mongoose");

const contentModel = new mongoose.Schema(
    {
        unit: { type: String, required: true },
        grade: { type: String, default: 12 },
        subject: { type: String, required: true },
        listOfLessions: [{ type: mongoose.Types.ObjectId, ref: "lession" }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("content", contentModel);
