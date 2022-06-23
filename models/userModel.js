const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            require: true,
            trim: true,
            maxlength: 30,
        },
        email: {
            type: String,
            require: true,
            unique: true,
        },
        mobile: { type: String, default: "", require: true },
        password: {
            type: String,
            require: true,
        },
        grade: { type: Number, default: 6, require: true },
        birthday: { type: Date, required: true },
        avatar: {
            type: String,
            default: "http://localhost:5000/defaultAvatar.jpg",
        },
        role: { type: Number, default: 0 },
        history: [
            {
                exam: { type: mongoose.Types.ObjectId, ref: "exam" },
                startTime: { type: Date, required: true },
                score: { type: Number, required: true, default: 0 },
                isSubmit: { type: Boolean, required: true, default: false },
                answers: [
                    {
                        questionId: { type: mongoose.Types.ObjectId, ref: "question" },
                        answer: { type: String, required: true },
                    },
                ],
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
