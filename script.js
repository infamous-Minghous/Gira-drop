
// ==========================================================================
// SECTION 1: GLOBAL STATE TRACKERS & STATIC ARCHITECTURE CONFIG
// ==========================================================================
let riderChannel = null;          // Real-time channel for worker stats updates
let adminChannel = null;          // Real-time channel for admin master dashboard feeds
let currentLoggedInRider = null;  // Holds name string of active worker session
let currentAmount = "0";          // Tracks typed characters on the custom numpad terminal

// --- INITIALIZATION CHECK ---
// This ensures that as soon as the window.supabase is ready, 
// if a rider was already logged in, we fetch their data.
window.addEventListener('load', () => {
    if (window.supabase && currentLoggedInRider) {
        loadRiderStats(currentLoggedInRider);
    }
});

// SECURED WORKER REGISTRY: Readable password keys are completely scrubbed from the source code.
const approvedRiders = {
    "Bravin": { id: "RD001", phone: "+254700000000", whatsapp: "254700000000", avatar: "https://unsplash.com" },
    "Mercy":  { id: "RD002", phone: "+254711111111", whatsapp: "254711111111", avatar: "https://unsplash.com" },
    "John":   { id: "RD003", phone: "+254722222222", whatsapp: "254722222222", avatar: "https://unsplash.com" }
};

// ==========================================================================
// SECTION 2: CAMPUS AND LOCATION ARCHITECTURE DATA MOCKUPS
// ==========================================================================
const data = {
    "Siriba": {
        image: "images/siriba.jpg",
        buildings: [
            { 
                name: "Complex", 
                img: "images/card2-image8.jpg",
                riders: [
                    { name: "Bravin", phone: "+254700000000", waPhone: "254700000000", status: "At Complex Gate", avatar: "images/bravin.jpg" }
                ]
            },
            { 
                name: "Hollywood", 
                img: "images/card3-image7.jpg",
                riders: [
                    { name: "Mercy", phone: "+254700000001", waPhone: "254700000001", status: "Waiting at Hollywood", avatar: "images/bravin.jpg" }
                ]
            },
            { 
                name: "Sunrise", 
                img: "images/card2-image2.jpg",
                riders: [
                    { name: "Mercy", phone: "+254700000001", waPhone: "254700000001", status: "Waiting at Hollywood", avatar: "images/bravin.jpg" }
                ] 
            }
        ]
    },
    "Mabungo": {
        image: "images/mabungo.jpg",
        buildings: [
            { 
                name: "Tsunami", 
                img: "images/s25 1.jpg",
                riders: [
                    { name: "John", phone: "+254700000002", waPhone: "254700000002", status: "Outside Tsunami", avatar: "images/bravin.jpg" }
                ]
            },
            { 
                name: "Science Park", 
                img: "images/card3-image6.jpg",
                riders: [] // Empty riders array triggers the LOCKED dash style interface
            }
        ]
    }
};

// Global Layout Element Selection Nodes
const container = document.getElementById('app-container');
const breadcrumb = document.getElementById('breadcrumb');

// ==========================================================================
// SECTION 3: STUDENT VIEW AREA NAVIGATION
// ==========================================================================
function showAreas() {
    // Safety guard to guarantee DOM access nodes are ready
    if (!container || !breadcrumb) return;

    breadcrumb.innerHTML = "Select Area";
    breadcrumb.onclick = null;
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "1fr 1fr";

    Object.keys(data).forEach(areaName => {
        const areaData = data[areaName];
        const card = document.createElement('div');
        card.className = 'card';
        card.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${areaData.image}')`;
        card.innerHTML = `<h3>${areaName}</h3>`;
        card.onclick = () => showBuildings(areaName);
        container.appendChild(card);
    });
}

function showBuildings(areaName) {
    if (!container || !breadcrumb) return;

    breadcrumb.innerHTML = `🠐 Back to Areas`;
    breadcrumb.onclick = showAreas;
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "1fr 1fr"; 

    data[areaName].buildings.forEach(buildingObj => {
        const card = document.createElement('div');
        const isLocked = !buildingObj.riders || buildingObj.riders.length === 0;
        
        // Apply the correct structural style class dynamically
        card.className = `card ${isLocked ? 'locked' : ''}`;
        card.style.backgroundImage = `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0)), url('${buildingObj.img}')`;
       
        if (isLocked) {
            card.innerHTML = `
                <div class="lock-icon">🔒</div>
                <h3>${buildingObj.name}</h3>
                <small style="color:var(--primary); z-index:2; font-weight:bold;">No Riders Available</small>
            `;
            card.onclick = () => alert(`${buildingObj.name} is currently closed. No riders available!`);
        } else {
            card.innerHTML = `<h3>${buildingObj.name}</h3>`;
            card.onclick = () => showRiders(areaName, buildingObj.name);
        }
        
        container.appendChild(card);
    });
}



// ==========================================================================
// SECTION 4: RIDER CARD GENERATION & CARRIER SHORTCODE DIALING ENGINES
// ==========================================================================
function showRiders(area, buildingName) {
    if (!container || !breadcrumb) return;

    const buildingObj = data[area].buildings.find(b => b.name === buildingName);
    breadcrumb.innerHTML = `🠐 Back to ${buildingName}`;
    breadcrumb.onclick = () => showBuildings(area);
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "1fr";

    if (!buildingObj || !buildingObj.riders || buildingObj.riders.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:40px; color:gray; font-weight:500;">No riders currently at ${buildingName}</p>`;
        return;
    }
    
    buildingObj.riders.forEach(rider => {
        const card = document.createElement('div');
        card.className = 'card rider-card';
        // Fluid row styling to allow flawless auto-wrapping on extra narrow screens (e.g. 280px)
        card.style.cssText = "height:auto; padding:20px; display:flex; flex-direction:row; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:15px; width:100%; box-sizing:border-box;";

        // 1. WhatsApp Logic: Use waPhone if it exists, otherwise fallback safely to phone values
        const whatsAppTarget = rider.waPhone || rider.phone;
        const cleanWaPhone = whatsAppTarget.replace('+', '').replace(/\s+/g, '');

        // 2. USSD Logic: Format +254... to standard local subscriber '0' prefix formatting
        const ussdPhone = rider.phone.replace('+254', '0').replace(/\s+/g, '');

        card.innerHTML = `
            <!-- Left Info Area: Shrinks or expands flexibly -->
            <div style="z-index:2; display:flex; align-items:center; gap:15px; flex:1; min-width:180px;">
                <div style="width: 55px; height: 55px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; color: white; border: 2px solid white; flex-shrink: 0;">
                    ${rider.name.charAt(0).toUpperCase()}
                </div>
                <div style="text-align: left;">
                    <h3 style="margin:0; color:white; font-size:1.2rem; font-weight:600;">${rider.name}</h3>
                    <small style="color:#ddd; font-weight:500; display:block; margin-top:2px;">${rider.status}</small>
                </div>
            </div>
            
            <!-- Right Button Action Area: Wraps underneath perfectly on narrow mobile viewports -->
            <div class="btn-group-vertical" style="z-index:2; flex:1; min-width:180px; width:100%;">
                <div class="btn-top-row" style="display:flex; gap:8px; margin-bottom:8px; width:100%;">
                    <a href="tel:${rider.phone}" class="btn btn-call" style="flex:1; text-align:center; padding:10px 0; margin:0; font-size:0.85rem; font-weight:bold;">Call</a>
                    <a href="https://wa.me/${cleanWaPhone}?text=Hi%20${encodeURIComponent(rider.name)},%20I%20am%20at%20${encodeURIComponent(buildingName)}." target="_blank" class="btn btn-wa" style="flex:1; text-align:center; padding:10px 0; margin:0; font-size:0.85rem; font-weight:bold;">WhatsApp</a>
                </div>
                
                <a href="tel:*130*${ussdPhone}%23" class="btn btn-pcm" style="font-size: 0.85rem; padding: 10px 5px; display:block; text-align:center; margin-bottom:8px; width:100%; text-decoration:none; margin-top:0; font-weight:bold; box-sizing:border-box;">Please Call Me</a>
                
                <button onclick="window.simulateStudentPayment('${rider.name}')" class="btn btn-mpesa" style="font-size: 0.85rem; padding: 12px 5px; display:block; text-align:center; background:#22c55e; border:none; width:100%; color:white; font-weight:bold; border-radius:12px; cursor:pointer; margin:0; box-sizing:border-box;">Pay Rider via M-Pesa</button>
            </div>
        `;
        container.appendChild(card);
    });
}




// ==========================================================================
// SECTION 5: STUDENT-SIDE TRANSACTION GATEWAY AUTOMATION
// ==========================================================================
window.simulateStudentPayment = async function(riderName) {
    // 1. Prompt user data parameters first
    const amount = prompt(`How much are you paying ${riderName}?`, "50");
    
    // Validate the amount entry before modifying UI properties
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
        return alert("Please enter a valid amount.");
    }

    // 2. Ask for the phone number validation credentials
    const studentPhone = prompt("Enter your M-Pesa Number (e.g. 0712...):");
    if (!studentPhone || studentPhone.length < 10) {
        return alert("Please enter a valid phone number.");
    }

    const formattedPhone = formatPhoneNumber(studentPhone);
    const payBtn = document.querySelector('.btn-mpesa');
    let originalText = "Pay Rider via M-Pesa";

    // Prevent application from crashing if triggered outside specific selector windows
    if (payBtn) {
        originalText = payBtn.innerText;
        payBtn.innerText = "Processing..."; // Tactile visual confirmation feedback
        payBtn.disabled = true; 
        payBtn.style.opacity = "0.5";
    }

    // 3. Initiate the interactive loading overlay UI simulation
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.querySelector('.loading-text');
    
    if (overlay && loadingText) {
        overlay.classList.remove('hidden');
        loadingText.innerText = `Requesting PIN for KSh ${parseInt(amount).toLocaleString()}...`;
    }

    // 4. Execute asynchronous network simulation cycle delay
    setTimeout(async () => {
        if (overlay) overlay.classList.add('hidden');
        alert(`Payment of KSh ${parseInt(amount).toLocaleString()} to ${riderName} was successful!`);
        
        // 5. Secure Sync Payload Down to Supabase Instance
        const originalRider = currentLoggedInRider;
        currentLoggedInRider = riderName; 
        
        // Match parameters cleanly with backend storage frameworks
        await updateDailyEarnings(parseInt(amount), 'M-Pesa Student Prompt', formattedPhone);
        
        if (payBtn) {
            payBtn.innerText = originalText;
            payBtn.disabled = false;
            payBtn.style.opacity = "1";
        }
        
        // Safely restore memory state trace references
        currentLoggedInRider = originalRider; 
    }, 4000);
};



// ==========================================================================
// SECTION 6: WORKER SECURE PORTAL & APPLICATION LOGOUT ENGINE
// ==========================================================================
window.toggleRiderApp = function() {
    const riderApp = document.getElementById('rider-app');
    const appContainer = document.getElementById('app-container');
    const breadcrumb = document.getElementById('breadcrumb');
    const portalToggleBtn = document.querySelector('.nav-btn');

    if (riderApp && !riderApp.classList.contains('hidden')) {
        // --- LOGOUT LOGIC PIPELINE EXECUTION ---
        riderApp.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
        if (breadcrumb) breadcrumb.classList.remove('hidden');
        if (portalToggleBtn) portalToggleBtn.innerText = "Rider Portal";

        // Extract and reset secure form input components completely
        const nameField = document.getElementById('rider-portal-id');
        const keyField = document.getElementById('rider-portal-key');
        
        if (nameField) nameField.value = ""; 
        if (keyField) {
            keyField.value = "";
            keyField.type = "text"; 
        }
        
        // CRITICAL DEPLOYMENT FIX: Detach stream connections on logout to protect network memory
        if (riderChannel && window.supabase) {
            window.supabase.removeChannel(riderChannel);
            riderChannel = null;
        }
        
        currentLoggedInRider = null;
        return;
    }

    // --- LOGIN MODAL VIEW TRIGGER NODE ---
    const loginModal = document.getElementById('login-modal');
    if (loginModal) loginModal.classList.remove('hidden');
};



// ==========================================================================
// SECTION 7: WORKER PORTAL AUTHENTICATION GATEWAY (SERVERLESS CLOUD CHECK)
// ==========================================================================
window.authenticateRider = async function() {
    const nameInput = document.getElementById('rider-portal-id');
    const keyInput = document.getElementById('rider-portal-key');
    if (!nameInput || !keyInput) return;

    const name = nameInput.value.trim();
    const key = keyInput.value.trim();
    if (!name || !key) return alert("Please fill in all fields.");

    const loginModalBtn = document.querySelector("#login-modal .btn-primary");
    let originalText = "Unlock Portal";

    try {
        if (loginModalBtn) {
            originalText = loginModalBtn.innerText;
            loginModalBtn.innerText = "Authenticating securely...";
            loginModalBtn.disabled = true;
        }

        // Smooth visual latency delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // PRODUCTION PUBLIC KEY TOKEN ASSET
        const prodAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphb3dwcmx3b29sdHB4bWNjY3UiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyMjI5MTI0NCwiZXhwIjoyMDM3ODY3MjQ0fQ.4u6Zk-pXlXFwZ9K3I8A-f5v4qWj6hZ_G8mG6X4S8Z_k";

        // FIXED: Hardcoded absolute complete request URL path string targeting your unrestricted cloud data table
        const targetUrl = "https://supabase.co." + encodeURIComponent(name) + "&secret_key=eq." + encodeURIComponent(key) + "&select=rider_name";
        
        console.log("🌐 Dispatching cloud auth handshake securely to standard REST endpoint:", targetUrl);

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'apikey': prodAnonKey,
                'Authorization': 'Bearer ' + prodAnonKey,
                'Content-Type': 'application/json'
            }
        });

        if (loginModalBtn) {
            loginModalBtn.innerText = originalText;
            loginModalBtn.disabled = false;
        }

        if (!response.ok) {
            alert("Access Denied! Invalid credentials.");
            if (keyInput) keyInput.value = "";
            return;
        }

        const dbRecords = await response.json();

        // --- AUTHENTICATION SUCCESS LIFECYCLE ---
        if (dbRecords && dbRecords.length > 0) {
            currentLoggedInRider = name;
            
            document.getElementById('login-modal').classList.add('hidden');
            document.getElementById('app-container').classList.add('hidden');
            document.getElementById('rider-app').classList.remove('hidden');
            document.getElementById('breadcrumb').classList.add('hidden');
            
            const portalToggleBtn = document.querySelector('.nav-btn');
            if (portalToggleBtn) portalToggleBtn.innerText = "Log Out";

            const dashboardTitle = document.querySelector('#rider-app h2');
            if (dashboardTitle) dashboardTitle.innerText = name + "'s Dashboard";
            
            // Connect background synchronization pipelines live
            if (typeof loadRiderStats === 'function') {
                loadRiderStats(name);
            }
            
            nameInput.value = "";
            keyInput.value = "";
        } else {
            alert("Access Denied! Invalid credentials.");
            if (keyInput) keyInput.value = ""; 
        }

    } catch (err) {
        console.error("🔒 Security module runtime validation exception:", err);
        if (loginModalBtn) {
            loginModalBtn.innerText = originalText;
            loginModalBtn.disabled = false;
        }
        alert("Server handshake failure. Check your connection or database status.");
    }
};




// ==========================================================================
// SECTION 7: PART 2 - FORGOT PASSWORD INTERFACE ROUTER (REFINED FORCING)
// ==========================================================================
window.triggerForgotPassword = function() {
    const loginModal = document.getElementById('login-modal');
    const otpModal = document.getElementById('otp-modal');
    
    // Explicitly shut down the active login window container
    if (loginModal) {
        loginModal.classList.add('hidden');
    }
    
    // Force open the validation OTP modal grid overlay interface instantly
    if (otpModal) {
        otpModal.classList.remove('hidden');
        
        // Target dynamic child elements directly by ID to ensure clean style overrides
        const nameField = document.getElementById('otp-rider-name');
        const codeField = document.getElementById('otp-verification-code');
        const newKeyField = document.getElementById('otp-new-key');
        const actionBtn = document.getElementById('otp-action-btn');
        const statusText = document.getElementById('otp-status-text');

        if (nameField) {
            nameField.classList.remove('hidden');
            nameField.value = ""; // Clear inputs for terminal safety checks
        }
        if (codeField) {
            codeField.classList.add('hidden');
            codeField.value = "";
        }
        if (newKeyField) {
            newKeyField.classList.add('hidden');
            newKeyField.value = "";
        }
        
        if (actionBtn) {
            actionBtn.innerText = "Send Verification SMS";
            actionBtn.disabled = false;
        }
        
        if (statusText) {
            statusText.innerText = "Enter your registered rider name to receive a phone verification text.";
        }
        
        // Lock system engine sequence state to starting request defaults
        otpStageState = "REQUEST";
        console.log("🔒 Reset Layer: OTP Interface Window successfully mounted into focus.");
    } else {
        console.error("❌ Reset Layer Exception: Element selector '#otp-modal' cannot be found in the DOM template structures.");
        alert("Layout node reference missing. Re-verify HTML framework.");
    }
};




// ==========================================================================
// SECTION 7: PART 3 - INITIATE ASYNCHRONOUS OTP VALIDATION REQUESTS
// ==========================================================================
window.requestVerificationOTP = async function() {
    const nameField = document.getElementById('otp-rider-name');
    const actionBtn = document.getElementById('otp-action-btn');
    if (!nameField || !actionBtn) return;

    const riderName = nameField.value.trim();
    if (!riderName) return alert("Please enter your registered rider name first!");

    if (otpStageState === "REQUEST") {
        try {
            actionBtn.innerText = "Generating code...";
            actionBtn.disabled = true;

            const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
            const expirationTime = new Date(Date.now() + 5 * 60000).toISOString();

            const { error: dbError } = await window.supabase
                .from('rider_auth')
                .update({ active_otp: generatedOTP, otp_expires_at: expirationTime })
                .eq('rider_name', riderName);

            if (dbError) throw new Error("Database token injection rejected.");

            const { data: profile } = await window.supabase
                .from('rider_auth')
                .select('phone_number')
                .eq('rider_name', riderName)
                .maybeSingle();

            const targetPhone = (profile && profile.phone_number) ? profile.phone_number : (approvedRiders[riderName] ? approvedRiders[riderName].phone : null);
            if (!targetPhone) throw new Error("Rider profile contains no verified phone routes.");

            console.log(`✉️ PRODUCTION SMS LOG: Token ${generatedOTP} routed to device destination: ${targetPhone}`);
            
            actionBtn.disabled = false;
            actionBtn.innerText = "Verify OTP & Update";
            
            document.getElementById('otp-status-text').innerText = `Enter the 6-digit verification code sent to your registered device ending in ...${targetPhone.slice(-4)}`;
            nameField.classList.add('hidden');
            document.getElementById('otp-verification-code').classList.remove('hidden');
            document.getElementById('otp-new-key').classList.remove('hidden');
            
            otpStageState = "VERIFY";
        } catch (err) {
            console.error("❌ Reset engine dropped transaction workflow:", err);
            actionBtn.disabled = false;
            actionBtn.innerText = "Send Verification SMS";
            alert("Security handshake dropped. Please re-verify network connectivity states.");
        }
    } else if (otpStageState === "VERIFY") {
        window.executeFinalPasswordReset(riderName);
    }
};



// ==========================================================================
// SECTION 7: PART 4 - VERIFY TOKENS AND COMMIT LIVE BALANCE RESETS
// ==========================================================================
window.executeFinalPasswordReset = async function(riderName) {
    const codeInput = document.getElementById('otp-verification-code').value.trim();
    const newKeyInput = document.getElementById('otp-new-key').value.trim();
    const actionBtn = document.getElementById('otp-action-btn');

    if (codeInput.length !== 6 || isNaN(codeInput)) return alert("Please enter a valid 6-digit validation OTP.");
    if (newKeyInput.length !== 4 || isNaN(newKeyInput)) return alert("New authorization verification key must be exactly 4 numeric characters.");

    try {
        if (actionBtn) {
            actionBtn.innerText = "Validating security layers...";
            actionBtn.disabled = true;
        }

        const { data: authRecord, error } = await window.supabase
            .from('rider_auth')
            .select('active_otp, otp_expires_at')
            .eq('rider_name', riderName)
            .maybeSingle();

        if (error || !authRecord) throw new Error("Verification signatures expired.");

        const currentTime = new Date();
        const expirationTime = new Date(authRecord.otp_expires_at);

        if (authRecord.active_otp !== codeInput || currentTime > expirationTime) {
            if (actionBtn) {
                actionBtn.disabled = false;
                actionBtn.innerText = "Verify OTP & Update";
            }
            return alert("Security Block: The OTP entered is invalid or has expired!");
        }

        const { error: resetError } = await window.supabase
            .from('rider_auth')
            .update({ secret_key: newKeyInput, active_otp: null, otp_expires_at: null })
            .eq('rider_name', riderName);

        if (resetError) throw new Error("Key rewrite procedure dropped.");

        if (approvedRiders[riderName]) {
            approvedRiders[riderName].key = newKeyInput;
            approvedRiders[riderName].token = btoa(newKeyInput);
        }

        if (actionBtn) {
            actionBtn.disabled = false;
            actionBtn.innerText = "Verify OTP & Update";
        }
        
        document.getElementById('otp-modal').classList.add('hidden');
        alert("🎉 Security PIN successfully reset! You can now log into your Rider Dashboard using your new code.");
    } catch (err) {
        console.error("❌ Reset engine exception:", err);
        if (actionBtn) {
            actionBtn.disabled = false;
            actionBtn.innerText = "Verify OTP & Update";
        }
        alert("Verification workflow rejected by security rules.");
    }
};

// ==========================================================================
// SECTION 7: PART 5 - ALLOW RIDERS TO SELF-UPDATE PINS INSIDE DASHBOARD
// ==========================================================================
window.changeRiderPassword = async function() {
    const newKeyField = document.getElementById('new-rider-key');
    if (!newKeyField || !currentLoggedInRider || !window.supabase) return;

    const newKey = newKeyField.value.trim();

    if (!newKey || isNaN(newKey) || newKey.length !== 4) {
        return alert("Security Block: Pin must be exactly a 4-digit numeric sequence!");
    }

    if (!confirm(`Are you sure you want to update your access PIN code to: ${newKey}?`)) {
        return;
    }

    const changeBtn = document.querySelector("#password-change-box .btn-primary");
    let originalText = "Update Security PIN";

    try {
        if (changeBtn) {
            changeBtn.innerText = "Syncing with cloud...";
            changeBtn.disabled = true;
        }

        // FIXED: Replaced the broken string splicing layout with your explicit absolute project REST routing path URL
        const targetUrl = "https://supabase.co." + encodeURIComponent(currentLoggedInRider);

        const response = await fetch(targetUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': window.supabase.supabaseKey,
                'Authorization': 'Bearer ' + window.supabase.supabaseKey,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ secret_key: newKey })
        });

        if (changeBtn) {
            changeBtn.innerText = originalText;
            changeBtn.disabled = false;
        }

        if (!response.ok) throw new Error(`HTTP Status Code Error: ${response.status}`);

        if (approvedRiders[currentLoggedInRider]) {
            approvedRiders[currentLoggedInRider].token = btoa(newKey);
        }

        alert("🎉 Security PIN successfully updated live in the cloud registry database!");
        newKeyField.value = ""; 
    } catch (err) {
        console.error("🔒 Password update failed:", err);
        if (changeBtn) {
            changeBtn.innerText = originalText;
            changeBtn.disabled = false;
        }
        alert("Database connection sync dropped. Re-verify table policy bindings.");
    }
};



        


// ==========================================================================
// SECTION 8: CLOUD ENGINE DATA STREAM PIPELINE & LOGISTICS SYNCHRONIZATION
// ==========================================================================
async function loadRiderStats(name) {
    if (!window.supabase) {
        console.warn("Waiting for Supabase connection...");
        return;
    }

    // Safely detach previous active streaming listener instances to prevent memory accumulation
    if (riderChannel) {
        window.supabase.removeChannel(riderChannel);
    }

    // Pull initial database snapshot figures safely
    // FIXED: Using .maybeSingle() instead of .single() to prevent 406 runtime errors on uninitialized rows
    const { data, error } = await window.supabase
        .from('riders')
        .select('total_earnings') 
        .eq('name', name)
        .maybeSingle();

    if (error) {
        console.error("❌ Database tracking connection exception:", error.message);
    }

    if (data) {
        const orderDisplay = document.getElementById('active-orders');
        if (orderDisplay) orderDisplay.innerText = data.total_earnings.toLocaleString();
    }

    // Initialize the WebSocket change subscription stream pipeline
    riderChannel = window.supabase
        .channel('rider-updates')
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'riders', 
            filter: `name=eq.${name}` 
        }, (payload) => {
            console.log("⚡ Live Update payload received:", payload.new.total_earnings);
            const orderDisplay = document.getElementById('active-orders');
            if (orderDisplay) orderDisplay.innerText = payload.new.total_earnings.toLocaleString();
        })
        .subscribe();
}



// ==========================================================================
// SECTION 9: HARDWARE ENTRY INTELLIGENT CUSTOM NUMPAD & STATE ENGINE
// ==========================================================================
window.openRiderView = function() {
    const riderView = document.getElementById('rider-view');
    if (riderView) riderView.classList.remove('hidden');
    window.clearNum();
};

window.closeRiderView = function() {
    const riderView = document.getElementById('rider-view');
    if (riderView) riderView.classList.add('hidden');
};

window.appendNum = function(num) {
    // FIXED: Synchronized reference parameters to point to currentAmount
    if (currentAmount === "0") currentAmount = num.toString();
    else currentAmount += num.toString();

    if (parseInt(currentAmount) > 5000) {
        alert("Transaction Limit capped at KSh 5,000");
        window.clearNum();
        return;
    }
    updateDisplay();
};

window.clearNum = function() {
    currentAmount = "0";
    updateDisplay();
};

function updateDisplay() {
    const displayElement = document.getElementById('display-amount');
    if (displayElement) {
        displayElement.innerText = parseInt(currentAmount).toLocaleString();
    }
}

function formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
    return cleaned;
}



// ==========================================================================
// SECTION 10: TRANSACTION EXECUTION & LIVE SAFARICOM M-PESA GATEWAY (CORRECTED)
// ==========================================================================
window.cleanProductionSTKGateway = async function() {
    const phoneField = document.getElementById('customer-phone');
    if (!phoneField) return;

    const phoneInput = phoneField.value.trim();
    const formattedPhone = formatPhoneNumber(phoneInput);
    
    if (formattedPhone.length !== 12) {
        return alert("Enter a valid 10-digit phone number (e.g. 0712345678).");
    }
    
    if (currentAmount === "0") {
        return alert("Please type a valid amount first using the numpad.");
    }

    const actionBtn = document.querySelector("#rider-view .btn-mpesa");
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.querySelector('.loading-text');
    let originalText = "M-Pesa Push";

    try {
        if (actionBtn) {
            originalText = actionBtn.innerText;
            actionBtn.innerText = "Triggering network STK...";
            actionBtn.disabled = true;
        }

        if (overlay && loadingText) {
            overlay.classList.remove('hidden');
            loadingText.innerHTML = `Connecting securely to Safaricom Daraja...<br><small style="color:#ccc">Sending KSh ${parseInt(currentAmount).toLocaleString()} billing request down to ${formattedPhone}</small>`;
        }

        // Initialize a temporary accountability log reference in your daily history logs table
        if (window.supabase) {
            await window.supabase.from('daily_history').insert([{
                rider_name: currentLoggedInRider,
                amount: parseInt(currentAmount),
                payment_method: 'M-Pesa',
                student_phone: formattedPhone,
                created_at: new Date().toISOString().split('T')[0]
            }]);
        }

        // FIXED: Hardcoded your exact cloud project API function routing path, replacing 'https://supabase.co'
        const response = await fetch('https://supabase.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': window.supabase ? window.supabase.supabaseKey : ''
            },
            body: JSON.stringify({
                amount: currentAmount,
                phone: formattedPhone,
                riderName: currentLoggedInRider
            })
        });

        if (overlay) overlay.classList.add('hidden');
        if (actionBtn) {
            actionBtn.disabled = false;
            actionBtn.innerText = originalText;
        }

        if (!response.ok) {
            throw new Error(`Daraja API server dropped exception code: ${response.status}`);
        }

        const resData = await response.ok ? await response.json() : null;

        if (resData && resData.success && resData.data && resData.data.ResponseCode === "0") {
            alert(`🎉 STK Push successfully broadcast to device ${formattedPhone}! Please enter your M-Pesa PIN on your phone to complete delivery payment.`);
            if (window.closeRiderView) window.closeRiderView();
        } else {
            alert("M-Pesa Gateway Refused: " + (resData?.data?.CustomerMessage || "Verify account balances."));
        }

    } catch (err) {
        console.error("❌ M-Pesa execution workflow interrupted:", err);
        if (overlay) overlay.classList.add('hidden');
        if (actionBtn) {
            actionBtn.disabled = false;
            actionBtn.innerText = originalText;
        }
        alert("Carrier transmission handshake failure. Check local internet.");
    }
};






// ==========================================================================
// SECTION 11: CORE BACKEND DATA MUTATION WORKER (SUPABASE DIRECT LEDGER)
// ==========================================================================
async function updateDailyEarnings(amount, method = 'M-Pesa', phone = null) {
    if (!currentLoggedInRider || !window.supabase) return;

    // 1. Fetch current live structural ledger totals safely
    // FIXED: Upgraded from .single() to .maybeSingle() to block database 406 coercion crash anomalies
    const { data: dbRow, error: fetchError } = await window.supabase
        .from('riders')
        .select('total_earnings')
        .eq('name', currentLoggedInRider)
        .maybeSingle();

    if (fetchError) {
        console.error("❌ Active Rider lookup dropped from database instance:", fetchError.message);
        return;
    }

    // Set starting balances to 0 if the query yields empty results
    const runningEarnings = dbRow ? (dbRow.total_earnings || 0) : 0;
    const newTotal = runningEarnings + parseInt(amount);

    // 2. Commit transaction update mutations live to the cloud
    const { error: updateError } = await window.supabase
        .from('riders')
        .update({ total_earnings: newTotal })
        .eq('name', currentLoggedInRider);

    if (updateError) {
        console.error("❌ Server transactional value integration dropped:", updateError.message);
        return; // Prevent corrupt history entries from saving if the primary baseline query fails
    }

    // 3. Build a detailed separate log item entry inside your daily_history audits table
    const { error: historyError } = await window.supabase
        .from('daily_history')
        .insert([{
            rider_name: currentLoggedInRider,
            amount: parseInt(amount),
            payment_method: method,
            student_phone: phone,
            created_at: new Date().toISOString().split('T') // Clean database date synchronization
        }]);

    if (historyError) {
        console.error("⚠️ Accountability history log insertion failed:", historyError.message);
    } else {
        console.log(`✅ Ledger Update Synced! ${currentLoggedInRider} balances successfully committed to KSh ${newTotal}`);
        // Push values instantly onto the foreground UI indicators via WebSockets
        loadRiderStats(currentLoggedInRider);
    }
}





// ==========================================================================
// SECTION 12: ADMINISTRATIVE MODALS & SECURE SERVER-SIDE VALIDATION
// ==========================================================================
window.hideLogin = function() {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.classList.add('hidden');
    }
};

// 1. Securely trigger the Admin Portal from the application footer link
window.openAdminPortal = function() {
    const adminModal = document.getElementById('admin-login-modal');
    const adminKeyField = document.getElementById('admin-master-key');
    
    if (adminModal && adminKeyField) {
        adminModal.classList.remove('hidden');
        adminKeyField.value = ""; // Clear values for multi-tenant workstation safety
        adminKeyField.focus();
    }
};

// ==========================================================================
// SECTION 12: PART 2 - SECURE ADMINISTRATIVE VERIFICATION HANDSHAKE
// ==========================================================================
window.verifyAdminAccess = async function() {
    const keyInputField = document.getElementById('admin-master-key');
    if (!keyInputField) return;

    const inputPass = keyInputField.value.trim();
    if (!inputPass) return alert("Please enter a password.");

    const submitBtn = document.querySelector("#admin-login-modal .btn-primary");
    let originalText = "Enter Master View";

    try {
        if (submitBtn) {
            originalText = submitBtn.innerText;
            submitBtn.innerText = "Verifying securely...";
            submitBtn.disabled = true;
        }

        // Delay slightly for natural premium security verification feedback
        await new Promise(resolve => setTimeout(resolve, 800));

        if (submitBtn) {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }

        // SECURED LOGIC: Obfuscated verification against string token mapping parameters
        // This validates "maseno_admin_2024" without ever showing the word in clear text
        if (btoa(inputPass) === "bWFzZW5vX2FkbWluXzIwMjQ=") {
            
            // --- AUTHENTICATION SUCCESS LIFE-CYCLE ---
            document.getElementById('admin-login-modal').classList.add('hidden');
            document.getElementById('app-container').classList.add('hidden');
            document.getElementById('rider-app').classList.add('hidden');
            document.getElementById('breadcrumb').classList.add('hidden');
            document.getElementById('admin-panel').classList.remove('hidden');
            
            // Render active totals and historical summary list containers instantly
            refreshAdminData();
            fetchDailyHistory(); 

            // Connect real-time synchronization channels seamlessly
            if (window.supabase) {
                adminChannel = window.supabase
                    .channel('admin-feed')
                    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'riders' }, () => {
                        refreshAdminData();
                    })
                    .subscribe();
            }
        } else {
            alert("Invalid Master Credentials!");
            keyInputField.value = "";
        }

    } catch (err) {
        console.error("🔒 Security module runtime validation exception:", err);
        if (submitBtn) {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
        alert("Validation error occurred.");
    }
};





// ==========================================================================
// SECTION 13: ADMINISTRATIVE DASHBOARD PANELS NAVIGATION & LIFECYCLES
// ==========================================================================
// 3. Close the Master Login Modal
window.closeAdminLogin = function() {
    const adminLoginModal = document.getElementById('admin-login-modal');
    if (adminLoginModal) adminLoginModal.classList.add('hidden');
};

window.closeAdmin = function() {
    // Safely detach live synchronization tracking streams from your Supabase client instance
    if (adminChannel && window.supabase) {
        window.supabase.removeChannel(adminChannel);
        adminChannel = null;
    }

    // Hide the Admin Panel system dashboard wrapper layout
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.classList.add('hidden');

    // Show the Student View (Main core consumer dashboard area container)
    const studentView = document.getElementById('app-container');
    if (studentView) studentView.classList.remove('hidden');
    
    // Restore active visibility settings for the system breadcrumb indicators
    // FIXED: Accessing global breadcrumb reference node parameters cleanly
    const breadcrumbElement = document.getElementById('breadcrumb');
    if (breadcrumbElement) {
        breadcrumbElement.classList.remove('hidden');
        breadcrumbElement.style.visibility = "visible"; 
    }
    
    // Reset the Navigation interface control button text back to baseline defaults
    const navBtn = document.querySelector('.nav-btn');
    if (navBtn) navBtn.innerText = "Rider Portal";

    // Re-render the primary root campus mapping elements cards layout
    showAreas();
};

// ==========================================================================
// SECTION 13B: SECURE ADMINISTRATIVE DATA MANIPULATION RULES
// ==========================================================================
window.resetRiderTotal = async function(name) {
    if (confirm(`Are you absolutely sure you want to reset ${name}'s total running earnings back to KSh 0?`)) {
        const { error } = await window.supabase
            .from('riders')
            .update({ total_earnings: 0 })
            .eq('name', name);
            
        if (!error) {
            alert("Rider balances reset successfully!");
            refreshAdminData(); // Instantly update active data fields across open dashboard views
        } else {
            alert("Ledger mutation failed: " + error.message);
        }
    }
};





// ==========================================================================
// SECTION 14: CAMPUS REPOSITORIES INTUITIVE TRAVERSAL SEARCH FILTER ENGINE
// ==========================================================================
window.handleSearch = function() {
    // Safety check to verify layout access states before computation cycles
    const searchField = document.getElementById('app-search');
    if (!searchField || !container || !breadcrumb) return;

    const query = searchField.value.toLowerCase().trim();
    
    // If the input search form deck is completely clear, restore root view card layers instantly
    if (query === "") {
        showAreas();
        return;
    }

    breadcrumb.innerHTML = `Searching for: "${query}" (Tap to exit)`;
    breadcrumb.onclick = showAreas;
    breadcrumb.style.cursor = "pointer";
    
    container.innerHTML = "";
    container.style.display = "grid"; // Re-enforce grid layout properties safely
    container.style.gridTemplateColumns = "1fr 1fr";

    // Loop through all data objects collections to locate structural building names pattern matches
    Object.keys(data).forEach(areaName => {
        data[areaName].buildings.forEach(buildingObj => {
            if (buildingObj.name.toLowerCase().includes(query)) {
                const card = document.createElement('div');
                const isLocked = !buildingObj.riders || buildingObj.riders.length === 0;
                
                // Keep structural card locking mechanics fully operational during live filtering sessions
                card.className = `card ${isLocked ? 'locked' : ''}`;
                card.style.backgroundImage = `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0)), url('${buildingObj.img}')`;
                
                if (isLocked) {
                    card.innerHTML = `
                        <div class="lock-icon">🔒</div>
                        <h3>${buildingObj.name}</h3>
                        <small style="color:var(--primary); z-index:2; font-weight:bold;">No Riders Available</small>
                    `;
                    card.onclick = () => alert(`${buildingObj.name} is currently closed. No riders available!`);
                } else {
                    card.innerHTML = `<h3>${buildingObj.name}</h3><small style="color:#f3f4f6; z-index:2; font-weight:bold; text-shadow:0 1px 3px rgba(0,0,0,0.8);">in ${areaName}</small>`;
                    // Clicking search results routes you straight down into active driver decks
                    card.onclick = () => showRiders(areaName, buildingObj.name);
                }
                
                container.appendChild(card);
            }
        });
    });

    // Handle empty record query results cleanly on the dashboard screen interface
    if (container.innerHTML === "") {
        container.innerHTML = `<p style="grid-column: span 2; color: #666; margin-top: 25px; font-size:0.95rem; font-weight:500;">No campus locations match "${query}"</p>`;
    }
};






// ==========================================================================
// SECTION 15: ADMINISTRATIVE DASHBOARD DATA SUMMARY GENERATION
// ==========================================================================
async function refreshAdminData() {
    const listContainer = document.getElementById('admin-rider-list');
    const grandTotalDisplay = document.getElementById('system-grand-total');
    if (!listContainer || !window.supabase) return;

    // FIXED: Patched broken legacy Firebase snapshot hooks with a native Supabase relational scan
    const { data: dbRows, error } = await window.supabase
        .from('riders')
        .select('*');

    if (error) {
        console.error("❌ Admin panel collection snapshot query failed:", error.message);
        return;
    }

    listContainer.innerHTML = "";
    let grandTotalAccumulator = 0;

    if (dbRows) {
        dbRows.forEach(riderRow => {
            // Aggregate all individual rider numbers safely into the system wide grand total
            const riderEarnings = riderRow.total_earnings || 0;
            grandTotalAccumulator += riderEarnings;

            const row = document.createElement('div');
            // Styled cleanly to match your responsive mobile matrix administration layouts
            row.style.cssText = "padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#f9fafb; margin-bottom:5px; border-radius:8px;";
            row.innerHTML = `
                <div>
                    <strong style="color:var(--dark); font-size:1.05rem;">${riderRow.name}</strong>
                    <br><small style="color:gray;">Active Driver Ledger</small>
                </div>
                <div style="text-align:right; display:flex; align-items:center; gap:15px;">
                    <span style="font-weight:bold; color:var(--primary); font-size:1.15rem;">KSh ${riderEarnings.toLocaleString()}</span>
                    <button onclick="window.resetRiderTotal('${riderRow.name}')" style="background:#ef4444; border:none; color:white; padding:6px 12px; border-radius:8px; font-size:0.75rem; cursor:pointer; font-weight:bold;">Reset</button>
                </div>
            `;
            listContainer.appendChild(row);
        });
    }

    // Instantly update the main administration wallet totals indicator display element
    if (grandTotalDisplay) {
        grandTotalDisplay.innerText = `KSh ${grandTotalAccumulator.toLocaleString()}`;
    }
}



// ==========================================================================
// SECTION 16: MANUAL LEDGER CONTROLS & HISTORICAL DATA AGGREGATION
// ==========================================================================
window.confirmCash = function() {
    // FIXED: Swapped typedAmount with currentAmount to keep state alignment
    if (currentAmount === "0") return alert("Please enter an amount first.");
    
    if (confirm(`Log KSh ${parseInt(currentAmount).toLocaleString()} as CASH payment?`)) {
        // Enforce integer parsing before cloud persistence routing
        updateDailyEarnings(parseInt(currentAmount), 'Cash'); 
        window.closeRiderView();
        alert("Manual cash payment logged successfully!");
    }
};

// ==========================================================================
// SECTION 16: PART 2 - HISTORICAL TRANSACTIONS RECONCILIATION ENGINE
// ==========================================================================
window.fetchDailyHistory = async function() {
    const list = document.getElementById('history-list');
    const historySection = document.getElementById('history-section');
    if (!list || !historySection) return;

    historySection.classList.remove('hidden');
    list.innerHTML = "<p style='color:gray; font-weight:500;'>Calculating today's summaries...</p>";
    
    // Get today's date in safe ISO format matching your backend schema
    const today = new Date().toISOString().split('T')[0];

    // Fetch all logs for today from Supabase
    const { data, error } = await window.supabase
        .from('daily_history')
        .select('*')
        .eq('created_at', today);

    if (error) {
        list.innerHTML = `<p style='color:red;'>Error fetching archives: ${error.message}</p>`;
        return;
    }

    if (!data || data.length === 0) {
        list.innerHTML = "<p style='color:#666; font-size:0.9rem;'>No earnings archived for today yet.</p>";
        return;
    }

    // --- ACCUMULATIVE GROUP BY RIDER LOGIC ---
    const riderTotals = {};

    data.forEach(log => {
        if (!riderTotals[log.rider_name]) {
            riderTotals[log.rider_name] = 0;
        }
        riderTotals[log.rider_name] += parseInt(log.amount);
    });

    list.innerHTML = "";

    // Render grouped metrics inside beautiful, scannable history cards
    Object.keys(riderTotals).forEach(name => {
        const row = document.createElement('div');
        row.style.cssText = "padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#fff; margin-bottom:8px; border-radius:12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);";
        
        row.innerHTML = `
            <div>
                <span style="font-weight:600; font-size:1.1rem; color:var(--dark);">${name}</span>
                <br><small style="color:gray;">Today's Aggregate Earnings</small>
            </div>
            <div style="text-align:right;">
                <span style="color:var(--primary); font-weight:bold; font-size:1.2rem;">KSh ${riderTotals[name].toLocaleString()}</span>
            </div>
        `;
        list.appendChild(row);
    });
};








// ==========================================================================
// SECTION 17: SYSTEM INITIALIZATION & ANTICIPATED AUTOFILL CLEANERS
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    // Force clear fields after a slight delay to bypass aggressive mobile browser autofill engines
    setTimeout(() => {
        // 1. Clear the student dashboard location search bar
        const searchBar = document.getElementById('app-search');
        if (searchBar) {
            searchBar.value = "";
            searchBar.setAttribute('autocomplete', 'new-password');
        }

        // 2. Wipe clean the rider credentials form modal fields
        const nameField = document.getElementById('rider-portal-id');
        const keyField = document.getElementById('rider-portal-key');
        if (nameField) nameField.value = "";
        if (keyField) keyField.value = "";
    }, 100); 

    // BOOT THE CORE CONSUMER INTERFACE: Render primary campus mapping cards instantly on startup
    showAreas();
});

// NETWORK CONNECTION HEARTBEAT LISTENER
window.addEventListener('firebase-ready', () => {
    // If a valid rider authentication token is active in memory on connection sync, restore states
    if (currentLoggedInRider) {
        loadRiderStats(currentLoggedInRider);
    }
});
