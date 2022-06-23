require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

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

app.use("/api", require("./routes/userRouter"));
app.use("/api", require("./routes/examRouter"));
app.use("/api", require("./routes/questionRouter"));
app.use("/api", require("./routes/contentAndLessionRouter"));

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
