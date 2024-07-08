// database/modles/users.js
const mongoose = require("mongoose");

const charSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    
});

const CharModle = mongoose.model("char", charSchema);
module.exports = CharModle;