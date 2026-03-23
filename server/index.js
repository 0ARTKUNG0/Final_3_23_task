const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const userRouter = require("./router/user.router");
const taskRouter = require("./router/task.router");

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;

app.use(cors({
    origin: process.env.BASE_URL,
    credentials: true
}));

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

if(!MONGODB_URL){
    console.error("MongoDB URL is missing. Please set it in your .env file.");
    process.exit(1);
}else{
    mongoose.connect(MONGODB_URL)
    .then(() => {
        console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
        console.error("MongoDB connection error", err.message);
    });
}

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/tasks", taskRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});