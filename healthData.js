const mongoose = require("mongoose");
const healthSchema = new mongoose.Schema({
    heartRate: Number,
    status: String,
    timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model("HealthData", healthSchema);