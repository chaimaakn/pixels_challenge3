// database/modles/users.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    Date:{
        type:Date,
        required:true,
        default: Date.now,
    }
   
    
});

const UserSchemaModle = mongoose.model("user", UserSchema);
module.exports = UserSchemaModle;