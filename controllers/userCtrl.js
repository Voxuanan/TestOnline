const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateEmail, validatePhone } = require("../utils/regexUtils");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

const userCtrl = {
    register: async (req, res) => {
        try {
            const { fullname, email, mobile, password, grade, birthday } = req.body;
            if (mobile && !validatePhone(mobile))
                return res.status(400).json({ msg: "This mobile format is incorrect." });
            if (email && !validateEmail(email))
                return res.status(400).json({ msg: "This email format is incorrect." });
            const user_mobile = await Users.findOne({ mobile: mobile });
            if (user_mobile) return res.status(400).json({ msg: "This mobile already exist." });
            const user_email = await Users.findOne({ email: email });
            if (user_email) return res.status(400).json({ msg: "This email already exist." });
            if (password.length < 6)
                return res.status(400).json({ msg: "Password must be at least 6 characters." });
            const passwordHash = await bcrypt.hash(password, 12);
            const newUser = new Users({
                fullname,
                email,
                mobile,
                password: passwordHash,
                grade,
                birthday,
            });
            const access_token = createAccessToken({ id: newUser._id });
            const refresh_token = createRefreshToken({ id: newUser._id });
            res.cookie("refreshtoken", refresh_token, {
                httpOnly: true,
                path: "/api/refresh_token",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            await newUser.save();
            res.json({
                msg: "Register success!",
                access_token,
                user: { ...newUser._doc, password: "" },
            });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    login: async (req, res) => {
        try {
            const { password, username } = req.body;
            if (!validateEmail(username) && !validatePhone(username))
                return res.status(400).json({ msg: "This username format is incorrect." });
            let user = await Users.findOne({ email: username });
            if (!user) user = await Users.findOne({ mobile: username });
            if (!user) {
                return res.status(400).json({ msg: "This email or mobile does not exist." });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: "Password is incorrect." });
            }

            const access_token = createAccessToken({ id: user._id });
            const refresh_token = createRefreshToken({ id: user._id });
            res.cookie("refreshtoken", refresh_token, {
                httpOnly: true,
                path: "/api/user/refresh_token",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
            res.json({
                msg: "Login success!",
                access_token,
                user: { ...user._doc, password: "" },
            });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie("refreshtoken", { path: "/api/user/refresh_token" });
            return res.json({ msg: "Logged out!" });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    generateAccessToken: async (req, res) => {
        try {
            const refresh_token = req.cookies.refreshtoken;
            if (!refresh_token) return res.status(400).json({ msg: "Please login." });
            jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, async (err, result) => {
                if (err) return res.status(400).json({ msg: "Please login." });
                const user = await Users.findById(result.id).select("-password");
                if (!user) return res.status(400).json({ msg: "This user does not exist." });
                const access_token = createAccessToken({ id: result.id });
                res.json({ msg: "Refresh token success!", access_token, user });
            });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    sendEmail: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await Users.findOne({ email });
            if (!user) return res.status(404).json({ msg: "User not found!" });
            user.resetPassword.slug = uuidv4();
            user.resetPassword.dateAllowed = moment(Date.now()).add(1, "m").toDate();
            user.save();
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.GMAIL_ACCOUNT,
                    pass: process.env.GMAIL_PASSWORD,
                },
            });
            var content = "";
            content += `
                <div style="padding: 10px; background-color: #003375">
                    <div style="padding: 10px; background-color: white;">
                        <h4 style="color: #0085ff">Đặt lại mật khẩu</h4>
                        <p>Click the link below to reset password</p>
                        <span style="color: black">http://localhost:5000/api/resetPassword/${user.resetPassword.slug}</span>
                    </div>
                </div>
            `;
            var mainOptions = {
                from: "TestOnline" + "&lt;" + process.env.GMAIL_ACCOUNT + "&gt;",
                to: user.email,
                subject: "Đặt lại mật khẩu",
                html: content,
            };
            transporter.sendMail(mainOptions, function (err, info) {
                if (err) {
                    return res.status(400).json({ msg: err.message });
                } else {
                    return res.json({ msg: info.response });
                }
            });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    updatePassword: async (req, res) => {
        try {
            const { slug } = req.params;
            const { newPassword } = req.body;

            const user = await Users.findOne({ "resetPassword.slug": slug });
            if (!user) return res.status(400).json({ msg: "User not found!" });
            if (moment(Date.now()).isAfter(user.resetPassword.dateAllowed))
                return res.status(400).json({ msg: "The time is up!" });
            if (!newPassword || newPassword.length < 6)
                return res.status(400).json({ msg: "Password must be at least 6 characters." });
            const passwordHash = await bcrypt.hash(newPassword, 12);
            const newUser = await Users.findByIdAndUpdate(
                { _id: user.id },
                { password: passwordHash },
                { new: true }
            );
            res.json({ msg: "updatePassword", newUser });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
};

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
};
module.exports = userCtrl;
