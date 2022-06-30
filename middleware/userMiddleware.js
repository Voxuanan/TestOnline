const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");

const userMiddleware = {
    isLogin: async (req, res, next) => {
        try {
            const token = req.headers["authorization"];
            if (!token) {
                return res.status(400).json({ msg: "Invalid authorization" });
            }
            const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            if (!decode) {
                return res.status(400).json({ msg: "Invalid authorization" });
            }
            const user = await Users.findOne({ _id: decode.id }).populate({
                path: "history.exam",
                populate: {
                    path: "listOfQuestion",
                },
            });
            req.user = user;
            next();
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    isAdmin: async (req, res, next) => {
        try {
            if (req.user.role !== 1) res.status(400).json({ msg: "Admin required!" });
            next();
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
};

module.exports = userMiddleware;
