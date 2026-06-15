const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    age: Number,
    bloodGroup: String,
    contact1Num: String,
    contact2Num: String,
    contact3Num: String,
    prescription: String,
    emergencyMed: String
});
module.exports = mongoose.model("User", userSchema);