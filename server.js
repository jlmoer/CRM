// Importations:
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const app = express();
const contactRouter = require("./routers/contactRouter");
const userRouter = require("./routers/userRouter");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// Middlewares:
app.use(express.json());
app.use(cookieParser());

// Connection to the database:
mongoose
    .connect(
        process.env.MONGO_URI
        ,
        {
            useNewUrlParser: true,
        }
    )
    .then(() => console.log("Connected to MongoDB"));

// Route imports:

// User Routes:
app.use("/user", userRouter);

// Contact Routes:
app.use("/contact", contactRouter);

// Server start:
app.listen(8000, () => {
    console.log("Listening on port 8000...");
});