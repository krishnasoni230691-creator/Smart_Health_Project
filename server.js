const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/public', express.static(path.join(__dirname, 'public')));

// Local MongoDB Connection Engine
mongoose.connect('mongodb://127.0.0.1:27017/smartHealthDB')
    .then(() => console.log('Connected to Local MongoDB Engine successfully!'))
    .catch(err => console.error('Database Connectivity Refused:', err));

// Expanded Medical Schema
const userSchema = new mongoose.Schema({
    name: String,
    age: Number,
    bloodGroup: String,
    emergencyPhone1: String,
    emergencyPhone2: String,
    emergencyPhone3: String,
    dailyMedicines: String,
    sosMedicines: String, // Attack ke waqt dene wali dawai
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const healthSchema = new mongoose.Schema({
    patientId: String, bpm: Number, lat: Number, lng: Number, timestamp: { type: Date, default: Date.now }
});
const Health = mongoose.model('Health', healthSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Route 1: Register Advanced Medical Profile
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ success: true, userId: newUser._id });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Route 2: Fetch Current Dynamic Active Patient ID for ESP32
app.get('/api/latest-patient', async (req, res) => {
    try {
        const latestUser = await User.findOne().sort({ createdAt: -1 });
        if (!latestUser) return res.json({ userId: "000000000000000000000000" });
        res.json({ userId: latestUser._id });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Route 3: Save Stream Logs & Trigger Multi-Contact Emergency Pipeline
app.post('/api/sensor-data', async (req, res) => {
    try {
        const log = new Health(req.body);
        await log.save();

        // Anomaly Processing Condition
        if (req.body.bpm > 150 || (req.body.bpm < 60 && req.body.bpm > 0)) {
            const patient = await User.findById(req.body.patientId);
            if (patient) {
                console.log(`\x1b[31m[CRITICAL MEDICAL EMERGENCY] Patient: ${patient.name} is vulnerable!\x1b[0m`);
                
                const mapsLink = `https://www.google.com/maps?q=${req.body.lat},${req.body.lng}`;
                const emergencyText = `🚨 *CRITICAL HEALTH ALERT* 🚨\n\n*Patient Name:* ${patient.name}\n*Live Pulse:* ${req.body.bpm} BPM\n*Condition:* Abnormal Cardiac Rhythm.\n\n📍 *Live GPS Location:* ${mapsLink}\n\n💊 *IMMEDIATE ACTION REQUIRED:* Please administer the SOS Medication immediately:\n👉 *${patient.sosMedicines}*`;

                // Sub-routine to push text template over backend stream
                const contacts = [patient.emergencyPhone1, patient.emergencyPhone2, patient.emergencyPhone3];
                contacts.forEach((phone, idx) => {
                    if(phone) {
                        console.log(`📡 [WhatsApp Pipeline] Dispatching Payload to Contact-${idx+1} [${phone}]:`);
                        console.log(`\x1b[33m"${emergencyText}"\x1b[0m\n-----------------------------------------`);
                    }
                });
            }
        }
        res.status(200).send("Sync Complete");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Route 4: Sync Polling Interface Engine
app.get('/api/dashboard/:userId', async (req, res) => {
    try {
        const profile = await User.findById(req.params.userId);
        if (!profile) return res.status(404).json({ error: "No profile verified" });

        const analytics = await Health.findOne({ patientId: req.params.userId }).sort({ timestamp: -1 });

        res.json({
            name: profile.name, age: profile.age, bloodGroup: profile.bloodGroup,
            phone1: profile.emergencyPhone1, phone2: profile.emergencyPhone2, phone3: profile.emergencyPhone3,
            dailyMeds: profile.dailyMedicines, sosMeds: profile.sosMedicines,
            bpm: analytics ? analytics.bpm : 0,
            lat: analytics ? analytics.lat : 23.2599, lng: analytics ? analytics.lng : 77.4126
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, '0.0.0.0', () => console.log('Backend Pipeline streaming live on Port 5000'));