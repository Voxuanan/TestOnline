const mongoose = require("mongoose");

const lessionModel = new mongoose.Schema(
    {
        name: { type: String, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("lession", lessionModel);
