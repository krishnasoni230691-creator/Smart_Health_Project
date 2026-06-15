// --- REGISTRATION ---
function register() {
    const userData = {
        name: document.getElementById("name").value,
        age: document.getElementById("age").value,
        contact1Num: document.getElementById("c1Num").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
        // Baaki fields bhi add kar sakte hain...
    };

    fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    }).then(() => {
        alert("✅ Account Created!");
        location.href = "login.html";
    });
}

// --- LOGIN (UserId save karne ke liye) ---
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    }).then(res => res.json()).then(user => {
        if (user !== "fail") {
            localStorage.setItem("userId", user._id); // Zaruri line
            localStorage.setItem("pName", user.name);
            location.href = "dashboard.html";
        } else {
            alert("❌ Wrong Login!");
        }
    });
}

// --- FREE GPS LOCATION LOGIC ---
// Jab dashboard par BPM 120+ dikhe, tab ye function chalayein
function triggerEmergencyAlert(heartRate) {
    const userId = localStorage.getItem("userId");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const data = {
                userId: userId,
                heartRate: heartRate,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            fetch("/save-emergency-location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(() => console.log("Alert Sent Successfully!"));

        }, (err) => {
            alert("Please Allow Location Access for Emergency Alerts!");
        });
    }
}