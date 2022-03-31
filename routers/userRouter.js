// Express importation:
const express = require("express");
const router = express.Router();

// Joi importation:
const Joi = require("joi");

// Other imports:
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
const User = require("../models/userModel");

// Routes:

// User creation/registration:
router.post("/register", async (req, res) => {
    if (req.body.password.length < 6) {
        return res.status(400).json({
            message: "The data is invalid",
        });
    }
    // Password hashing:
    const hashedPassword = await bcrypt.hash(req.body.password, 15);

    // User creation:
    try {
        await User.create({
            email: req.body.email,
            password: hashedPassword,
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "This account already exists"
        });
    }
    res.status(201).json({
        message: `User ${req.body.email} created`
    });
});

// User login:
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Check if the account associated to the email address exists:
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: "Your email or password are invalid",
        });
    }

    // Compare if the password matches the hash in the database:
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Your email or password are invalid",
        });
    }

    // Generate a token:
    const token = jwt.sign({ id: user._id }, secret);

    // Store the token inside a cookie:
    res.cookie("jwt", token, { httpOnly: true, secure: false });

    // Send the cookie to the client:
    res.json({
        message: "Here is your cookie",
    });
});

// Logout route:
router.get("/logout", (req, res) => {
    res.clearCookie('jwt');
    return res.status(200).json({
        message: "You have loged out",
    });
});

// Modules exportation:
module.exports = router;