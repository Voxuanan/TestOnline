const passport = require("passport");
const express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/profile", isLoggedIn, function (req, res) {
    const access_token = createAccessToken({ id: req.user._id });
    const refresh_token = createRefreshToken({ id: req.user._id });
    res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/user/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({
        msg: "Login success!",
        access_token,
        user: { ...req.user, password: "" },
    });
});

router.get("/error", isLoggedIn, function (req, res) {
    res.json({ msg: "Login fail!" });
});

router.get(
    "/auth/facebook",
    passport.authenticate("facebook", {
        scope: ["public_profile", "email", "user_birthday"],
    })
);

router.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", {
        successRedirect: "/api/profile",
        failureRedirect: "/api/error",
    })
);

router.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) {
            return res.status(400).json({ msg: err.message });
        }
        res.json({ msg: "Logout" });
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.status(400).json({ msg: "You haven't logged in yet!" });
}

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
};
module.exports = router;
