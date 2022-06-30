require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const Users = require("./models/userModel");

const app = express();

app.use(express.json());
app.use(
    cors({
        credentials: true,
        origin: "http://localhost:3000",
    })
);
app.use(cookieParser());
app.use(express.static("public"));
app.use(
    session({
        resave: false,
        saveUninitialized: true,
        secret: "SECRET",
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, cb) {
    cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.facebook_key,
            clientSecret: process.env.facebook_secret,
            callbackURL: process.env.callback_url,
            profileFields: ["id", "displayName", "photos", "email", "birthday"],
        },
        function (accessToken, refreshToken, profile, cb) {
            Users.findOrCreate({ profile, accessToken }, function (err, user) {
                return cb(err, user);
            });
            // return cb(null, { profile, accessToken });
        }
    )
);

app.use("/api", require("./routes/userRouter"));
app.use("/api", require("./routes/examRouter"));
app.use("/api", require("./routes/questionRouter"));
app.use("/api", require("./routes/contentAndLessionRouter"));
app.use("/api", require("./routes/loginWithFaceBookRouter"));

const port = process.env.PORT || 5000;

const URI = process.env.MONGO_URL;
mongoose.connect(
    URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err) => {
        if (err) throw err;
        console.log("Connected to MongoDB");
    }
);

app.listen(port, () => {
    console.log("Sever is running on http://localhost:" + port);
});
