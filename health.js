const express = require("express");
const router = express.Router();
const HealthData = require("../models/HealthData");
const User = require("../models/User");
const axios = require("axios");

// SIRF CALLMEBOT KEY CHAHIYE (Free hai)
const CALLMEBOT_API_KEY = "YOUR_CALLMEBOT_KEY"; 

// 1. Purana ESP32 wala route (Sirf data save ke liye)
router.post("/save-alert", async (req, res) => {
    try {
        const { userId, heartRate } = req.body;
        const alert = new HealthData({ userId, heartRate, status: heartRate > 120 ? "Emergency" : "Normal" });
        await alert.save();
        res.send("saved");
    } catch (err) { res.status(500).send("error"); }
});

// 2. NAYA FREE ROUTE (Jo phone ke GPS se location bhejega)
router.post("/save-emergency-location", async (req, res) => {
    try {
        const { userId, heartRate, latitude, longitude } = req.body;

        // Database mein location ke saath save karna
        const alert = new HealthData({
            userId, heartRate, latitude, longitude, status: "Emergency"
        });
        await alert.save();

        // WhatsApp Alert bhejna
        const user = await User.findById(userId);
        if (user) {
            const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const message = `🚨 *EMERGENCY ALERT!* \n\nPatient: *${user.name}* \nBPM: *${heartRate}* \nLive Location: ${mapsLink}`;
            
            await axios.get(`https://api.callmebot.com/whatsapp.php?phone=${user.contact1Num}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_API_KEY}`);
        }
        res.send("Alert Sent!");
    } catch (err) {
        res.status(500).send("Error");
    }
});

module.exports = router;