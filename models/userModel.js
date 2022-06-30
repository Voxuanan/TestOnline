const mongoose = require("mongoose");
const downloadFile = require("../utils/downloadFile");

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
        facebookId: { type: Number },
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

userSchema.statics.findOrCreate = function findOrCreate({ profile, accessToken }, cb) {
    var userObj = new this();
    this.findOne({ facebookId: profile.id }, async function (err, result) {
        if (!result) {
            userObj.fullname = profile._json.name;
            userObj.email = profile._json.email;
            downloadFile(
                `https://graph.facebook.com/v3.3/${profile.id}/picture?width=900&access_token=${accessToken}`,
                profile.id,
                () => {
                    // console.log("Download picture");
                }
            );
            userObj.avatar = `http://localhost:5000/images/${profile.id}.jpg`;
            userObj.birthday = profile._json.birthday;
            userObj.facebookId = profile.id;
            userObj.save(cb);
        } else {
            cb(err, result);
        }
    });
};

module.exports = mongoose.model("User", userSchema);
