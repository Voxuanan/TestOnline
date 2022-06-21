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
    },
    { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
