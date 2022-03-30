// Imports:
const mongoose = require("mongoose");

// Schema creation:
const ContactsSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        maxLength: 500,
    },
    category: {
        type: String,
        required: true,
    }
});

const Contact = mongoose.model("Contact", ContactsSchema);

// Schema export:
module.exports = Contact;