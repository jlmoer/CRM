// Imports:
const mongoose = require("mongoose");

// Schema creation:
const UsersSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        minLength: 8,
        required: true,
    }
});

const User = mongoose.model("User", UsersSchema);

// Schema export:
module.exports = User;