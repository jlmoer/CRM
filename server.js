// Importations:
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// Models:
const Contact = require("./models/contactModel");
const User = require("./models/userModel");

const secret = process.env.SECRET;

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

// Routes:

// User creation/registration:
app.post("/register", async (req, res) => {
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
app.post("/login", async (req, res) => {
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

// Routes to deal with all the requests related to contacts:

// Route to create a contact:
app.post("/contacts", async (req, res) => {
    let data;
    try {
        data = jwt.verify(req.cookies.jwt, secret);
        try {
            const contact = await Contact.create({
                userId: data.id,
                name: req.body.name,
                email: req.body.email,
                description: req.body.description,
                category: req.body.category,
            })
        } catch (err) {
            return res.status(401).json({
                message: "No existing contact",
            });
        }
    } catch (err) {
        return res.status(401).json({
            message: "Your token is invalid",
        });
    }
})

// Route to get all the contacts:
app.get("/contacts", async (req, res) => {

    // Check if the token is stored inside the cookie:
    let data;
    try {
        data = jwt.verify(req.cookies.jwt, secret);
        try {
            const contact = await Contact.find({ userId: data.id })

            // The user is authentified/allowed:
            res.json({
                message: "Your request has been accepted",
                data: contact,
            });
        } catch (err) {
            return res.status(401).json({
                message: "Your request is invalid",
            })
        }
    } catch (err) {
        return res.status(401).json({
            message: "Your token is invalid",
        });
    }
});

// Route to modify a contact:
app.put("/contacts/:id", async (req, res) => {
    try {
        const data = jwt.verify(req.cookies.jwt, secret);
        const contact = await Contact.findByIdAndUpdate(req.params.id, {
            userId: data.id,
            name: req.body.name,
            email: req.body.email,
            description: req.body.description,
            category: req.body.category,
        });
        res.json({
            message: "Contact modified",
            data: contact,
        });
    } catch (err) {
        return res.status(401).json({
            message: "Your request is not allowed",
        });
    }
});

// Route to delete a contact:
app.delete("/contacts/:id", async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
    } catch (err) {
        return res.status(400).json({
            message: "Request not possible. Please check your code.",
        })
    }
    res.status(201).json({
        message: "Contact deleted",
    })
})

// Server start:
app.listen(8000, () => {
    console.log("Listening on port 8000...");
});