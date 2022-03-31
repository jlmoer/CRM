// Express importation:
const express = require("express");
const router = express.Router();

// Joi importation:
const Joi = require("joi");
const secret = process.env.SECRET;
const jwt = require("jsonwebtoken");

const Contact = require("../models/contactModel");

// Routes:

// Route to create a contact:
router.post("/", async (req, res) => {
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
router.get("/", async (req, res) => {

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
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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

// Modules exportation:
module.exports = router;