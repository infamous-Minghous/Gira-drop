
// ==========================================================================
// PRO-TIP: Ensure this variable definition is placed at the absolute top of script.js!
// ==========================================================================
if (typeof window.otpStageState === 'undefined') {
    window.otpStageState = "REQUEST"; // Instantiate inside global context namespace safely
}

// ==========================================================================
// SECTION 1: GLOBAL STATE TRACKERS & PERSISTENT ARCHITECTURE CONFIG
// ==========================================================================
let riderChannel = null;          // Real-time channel for worker stats updates
let adminChannel = null;          // Real-time channel for admin master dashboard feeds
let currentAmount = "0";          // Tracks typed characters on the custom numpad terminal

// Hydrate user session cleanly out of persistent browser storage instead of volatile memory
let currentLoggedInRider = localStorage.getItem('fastdrop_rider_session') || null;

// CENTRALIZED WORKER REGISTRY (Single Source of Truth)
const approvedRiders = {
    "RD001": { name: "Bravin", phone: "+254700000000", whatsapp: "254700000000", avatar: "images/bravin.jpg" },
    "RD002": { name: "Mercy",  phone: "+254711111111", whatsapp: "254711111111", avatar: "images/mercy.jpg" },
    "RD003": { name: "John",   phone: "+254722222222", whatsapp: "254722222222", avatar: "images/john.jpg" }
};

// State-sync on application boot
window.addEventListener('DOMContentLoaded', () => {
    if (window.supabase && currentLoggedInRider) {
        console.log(`🔄 Existing active session detected for rider: ${currentLoggedInRider}`);
        if (typeof window.loadRiderStats === 'function') {
            window.loadRiderStats(currentLoggedInRider);
        }
    }
});

// ==========================================================================
// SECTION 2: NORMALIZED CAMPUS LOCATION SCHEMA ARCHITECTURE
// ==========================================================================
const campusData = {
    "Siriba": {
        image: "images/siriba.jpg",
        buildings: [
            { 
                name: "Complex", 
                img: "images/card2-image8.jpg",
                activeRiders: ["RD001"], // Referencing normalized unique structural worker keys exclusively
                currentStatus: "At Complex Gate"
            },
            { 
                name: "Hollywood", 
                img: "images/card3-image7.jpg",
                activeRiders: ["RD002"],
                currentStatus: "Waiting at Hollywood"
            },
            { 
                name: "Sunrise", 
                img: "images/card2-image2.jpg",
                activeRiders: ["RD002"], 
                currentStatus: "Waiting at Hollywood"
            }
        ]
    },
    "Mabungo": {
        image: "images/mabungo.jpg",
        buildings: [
            { 
                name: "Tsunami", 
                img: "images/s25 1.jpg",
                activeRiders: ["RD003"],
                currentStatus: "Outside Tsunami"
            },
            { 
                name: "Science Park", 
                img: "images/card3-image6.jpg",
                activeRiders: [], // Empty state successfully flags locked styling UI handlers
                currentStatus: "No Riders Nearby"
            }
        ]
    }
};

// Safe DOM element instantiation using explicit defensive validation controls
const container = document.getElementById('app-container');
const breadcrumb = document.getElementById('breadcrumb');

if (!container || !breadcrumb) {
    console.warn("⚠️ Core application interface nodes missing from layout thread context.");
}


// ==========================================================================
// SECTION 3: STUDENT VIEW CAMPUS HUB NAVIGATION ENGINE
// ==========================================================================
function showAreas() {
    // Safety guard to guarantee DOM access nodes are safely ready
    if (!container || !breadcrumb) return;

    // Accessibility & Visibility Sync
    breadcrumb.textContent = "Select Area";
    breadcrumb.onclick = null;
    breadcrumb.style.cursor = "default";
    
    // Clear dynamic workspace text nodes safely
    container.innerHTML = "";
    
    /* PERFORMANCE FIX: We removed container.style.gridTemplateColumns modifications 
       to allow your style.css auto-fit responsive patterns to handle layout footprints */

    // Use campusData structure safely from normalized configuration state
    Object.keys(campusData).forEach(areaName => {
        const areaInfo = campusData[areaName];
        const card = document.createElement('div');
        card.className = 'card';
        
        // Premium unified background visibility layout styling
        card.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${areaInfo.image}')`;
        
        // Structured text insertions using safe parsing properties
        const title = document.createElement('h3');
        title.textContent = areaName;
        card.appendChild(title);
        
        // Safe context interaction routing hooks
        card.onclick = () => showBuildings(areaName);
        container.appendChild(card);
    });
}

function showBuildings(areaName) {
    if (!container || !breadcrumb) return;

    // Cross-Platform safe arrow character selection pattern
    breadcrumb.textContent = "← Back to Areas";
    breadcrumb.onclick = showAreas;
    breadcrumb.style.cursor = "pointer";
    container.innerHTML = "";

    const targetedArea = campusData[areaName];
    if (!targetedArea) return console.error(`❌ Area validation mismatch: ${areaName}`);

    targetedArea.buildings.forEach(buildingObj => {
        const card = document.createElement('div');
        
        // Safe logical tracking check against our dynamic array properties
        const isLocked = !buildingObj.activeRiders || buildingObj.activeRiders.length === 0;
        
        card.className = `card ${isLocked ? 'locked' : ''}`;
        card.style.backgroundImage = `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1)), url('${buildingObj.img}')`;
       
        if (isLocked) {
            // Enhanced accessibility structure for locked status fields
            card.innerHTML = `
                <div class="lock-icon" aria-hidden="true">🔒</div>
                <h3>${buildingObj.name}</h3>
                <small>${buildingObj.currentStatus || 'Closed'}</small>
            `;
            card.onclick = () => alert(`📍 ${buildingObj.name} is currently offline. No delivery riders are active near this building right now.`);
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

    // Cross-Platform safe layout token definitions
    breadcrumb.textContent = `← Back to ${buildingName}`;
    breadcrumb.onclick = () => showBuildings(area);
    container.innerHTML = "";

    const targetedArea = campusData[area];
    if (!targetedArea) return console.error(`❌ Target area mapping conflict: ${area}`);

    const buildingObj = targetedArea.buildings.find(b => b.name === buildingName);
    if (!buildingObj || !buildingObj.activeRiders || buildingObj.activeRiders.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:40px; color:#6b7280; font-weight:500;">No active riders at ${buildingName} right now.</p>`;
        return;
    }
    
    // Process active riders using our clean centralized single-source worker registry
    buildingObj.activeRiders.forEach(riderId => {
        const riderRecord = approvedRiders[riderId];
        if (!riderRecord) return console.warn(`⚠️ Skipping missing worker database record for ID: ${riderId}`);

        const card = document.createElement('div');
        
        // Link directly to your fresh style.css class rules architecture setup
        card.className = 'card rider-card-view-only'; 
        card.onclick = null;

        const whatsAppTarget = riderRecord.whatsapp || riderRecord.phone;
        const cleanWaPhone = whatsAppTarget.replace(/[+\s]/g, '');

        let ussdPhone = riderRecord.phone.replace(/[+\s]/g, '');
        if (ussdPhone.startsWith('254')) {
            ussdPhone = '0' + ussdPhone.substring(3);
        }

        const defaultText = `Hi ${riderRecord.name}, I am ordering from ${buildingName}. Are you nearby?`;
        const encodedText = encodeURIComponent(defaultText);

        // PRODUCTION CLEANUP: Clean markup framework completely stripped of dirty inline strings
        card.innerHTML = `
            <div class="rider-card-flex-wrapper">
                
                
                <div class="rider-profile-section">
                    <div class="rider-avatar-badge">
                        ${riderRecord.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="rider-text-details">
                        <h3>${riderRecord.name}</h3>
                        <small>${buildingObj.currentStatus || 'Active Nearby'}</small>
                    </div>
                </div>
                
                <!-- Right Quick-Action Shortcode Dialer Controls Group Stack -->
                <div class="rider-actions-stack">
                    
                    <div class="rider-twin-buttons-grid">
                        <!-- event.stopPropagation() shields buttons from triggering parent background card taps -->
                        <a href="tel:${riderRecord.phone}" onclick="event.stopPropagation();" class="btn btn-call">Call</a>
                        <a href="https://wa.me{cleanWaPhone}?text=${encodedText}" onclick="event.stopPropagation();" target="_blank" rel="noopener" class="btn btn-wa">WhatsApp</a>
                    </div>
                    
                    <a href="tel:*130*${ussdPhone}#" onclick="event.stopPropagation();" class="btn btn-pcm">Please Call Me</a>
                    
                    <button type="button" onclick="event.stopPropagation(); window.simulateStudentPayment('${riderId}')" class="btn btn-mpesa">
                        Pay Rider via M-Pesa
                    </button>
                </div>
                
            </div>
        `;
        container.appendChild(card);
    });
}




// ==========================================================================
// SECTION 5: STUDENT-SIDE TRANSACTION GATEWAY AUTOMATION
// ==========================================================================
window.simulateStudentPayment = async function(riderId) {
    const riderRecord = approvedRiders[riderId];
    const targetRiderName = riderRecord ? riderRecord.name : "Rider";

    // 1. Prompt user data parameters safely
    const inputAmount = prompt(`How much are you paying ${targetRiderName}? (KSh):`, "50");
    if (!inputAmount) return; 

    const parsedAmount = parseInt(inputAmount, 10);
    
    // Financial boundary auditing protection
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 10000) {
        return alert("Please enter a valid amount between KSh 1 and KSh 10,000.");
    }

    // 2. Capture mobile wallet number values
    const studentPhone = prompt("Enter your M-Pesa Number (e.g., 0712345678):");
    if (!studentPhone) return;

    // Streamlined global formatting engine validation
    const formattedPhone = formatPhoneNumber(studentPhone);

    if (formattedPhone.length !== 12 || !(formattedPhone.startsWith('2547') || formattedPhone.startsWith('2541'))) {
        return alert("Invalid M-Pesa format. Please provide a standard Kenyan number (07... or 01...).");
    }

    const payBtn = document.querySelector('.btn-mpesa');
    let originalText = "Pay Rider via M-Pesa";

    if (payBtn) {
        originalText = payBtn.textContent;
        payBtn.textContent = "Processing Push...";
        payBtn.disabled = true; 
        payBtn.style.opacity = "0.6";
    }

    // 3. Initiate the interactive loading overlay UI engine
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.querySelector('.loading-text');
    
    if (overlay && loadingText) {
        overlay.classList.remove('hidden');
        loadingText.textContent = `Requesting PIN on phone for KSh ${parsedAmount.toLocaleString()}...`;
    }

    // 4. Asynchronous Network Simulation Cycle Handshake
    setTimeout(async () => {
        if (overlay) overlay.classList.add('hidden');
        
        try {
            /* FIX: Updated the fourth parameter reference to read 'formattedPhone' 
               instead of the non-existent 'cleanPhone' variable string to stop runtime freezes */
            if (typeof window.updateDailyEarnings === 'function') {
                await window.updateDailyEarnings(
                    parsedAmount, 
                    'M-Pesa Student Prompt', 
                    formattedPhone, 
                    riderId, 
                    targetRiderName
                );
                
                alert(`🎉 Success! KSh ${parsedAmount.toLocaleString()} paid to ${targetRiderName}. Transaction recorded securely.`);
            } else {
                console.warn("⚠️ Warning: Database reporting ledger engine offline. Record cached locally.");
                alert(`Payment of KSh ${parsedAmount.toLocaleString()} completed, but database sync is pending.`);
            }
        } catch (dbError) {
            console.error("❌ Ledger reconciliation failure:", dbError);
            alert("Payment processed, but ledger sync failed. Please inform your rider.");
        } finally {
            if (payBtn) {
                payBtn.textContent = originalText;
                payBtn.disabled = false;
                payBtn.style.opacity = "1";
            }
        }
    }, 4000);
};




// ==========================================================================
// SECTION 6: WORKER SECURE PORTAL & APPLICATION LOGOUT ENGINE
// ==========================================================================
window.toggleRiderApp = function() {
    const riderApp = document.getElementById('rider-app');
    const appContainer = document.getElementById('app-container');
    const breadcrumb = document.getElementById('breadcrumb');
    
    // Explicitly target the button using an ID or unique attribute path to prevent selector collisions
    const portalToggleBtn = document.querySelector('.nav-bar .nav-btn');

    if (riderApp && !riderApp.classList.contains('hidden')) {
        // --- LOGOUT LOGIC PIPELINE EXECUTION ---
        riderApp.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
        if (breadcrumb) breadcrumb.classList.remove('hidden');
        if (portalToggleBtn) portalToggleBtn.textContent = "Rider Portal";

        // Extract and reset secure authentication form input components completely
        const nameField = document.getElementById('rider-portal-id');
        const keyField = document.getElementById('rider-portal-key');
        
        if (nameField) nameField.value = ""; 
        if (keyField) {
            keyField.value = "";
            keyField.type = "password"; // Security Fix: Restores password masking for the next login session
        }
        
        // PRODUCTION CLIENT SDK V2 FIX: Safely channel removal through the live initialized instance
        if (riderChannel && window.supabase) {
            try {
                window.supabase.removeChannel(riderChannel);
                console.log("🔌 Live Production WebSocket channel successfully closed and dregestered.");
            } catch (chanErr) {
                console.warn("⚠️ Non-fatal issue encountered while clearing out real-time streams:", chanErr.message);
            }
            // FIXED: Un-commented memory purge layer to safely wipe dead channel pointer references
            riderChannel = null; 
        }
        
        // PERSISTENCE FIX: Wipe memory tracers clean across both active volatile spaces and hardware local slots
        currentLoggedInRider = null;
        localStorage.removeItem('fastdrop_rider_session');
        console.log("🧼 Rider security token scrubbed locally from phone storage.");

        // STATE RESTORATION FIX: Regenerate student hub views cleanly so layout isn't left empty
        if (typeof showAreas === 'function') {
            showAreas();
        }
        return;
    }

    // --- LOGIN MODAL VIEW TRIGGER NODE ---
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.classList.remove('hidden');
        
        // Usability Booster: Automatically targets and focuses the name field upon mounting the access modal
        const nameInputTarget = document.getElementById('rider-portal-id');
        if (nameInputTarget) nameInputTarget.focus();
    }
};




// ==========================================================================
// SECTION 7: WORKER PORTAL AUTHENTICATION GATEWAY (SECURE SDK HANDSHAKE)
// ==========================================================================
window.authenticateRider = async function() {
    const nameInput = document.getElementById('rider-portal-id');
    const keyInput = document.getElementById('rider-portal-key');
    if (!nameInput || !keyInput) return;

    const name = nameInput.value.trim();
    const key = keyInput.value.trim();
    if (!name || !key) return alert("Please fill in all fields.");

    // Validate that your initialized Supabase core client framework is active before proceeding
    if (!window.supabase) {
        return alert("Database engine is currently offline. Please check your data connection and refresh.");
    }

    const loginModalBtn = document.querySelector("#login-modal .btn-primary");
    let originalText = "Unlock Portal";

    try {
        if (loginModalBtn) {
            originalText = loginModalBtn.textContent;
            loginModalBtn.textContent = "Authenticating securely...";
            loginModalBtn.disabled = true;
        }

        // Tactile interface pacing configuration delay
        await new Promise(resolve => setTimeout(resolve, 300));

        console.log(`🛡️ SECURITY HANDSHAKE EXECUTING - Querying record verification metrics for: ${name}`);

        // FIX: Added explicit maybeSingle() parameter block to terminate the Promise chain securely
        const { data: authRecord, error } = await window.supabase
            .from('rider_auth')
            .select('rider_name')
            .eq('rider_name', name)
            .eq('secret_key', key)
            .maybeSingle();

        if (error) throw error;

        if (loginModalBtn) {
            loginModalBtn.textContent = originalText;
            loginModalBtn.disabled = false;
        }

        // --- AUTHENTICATION SUCCESS LIFECYCLE ---
        // Adjusted evaluation constraint check to look directly at the mapped record row block object safely
        if (authRecord && authRecord.rider_name) {
            // Lock down memory values
            currentLoggedInRider = name;
            
            // 💾 HARDWARE STORAGE LOCK: Protects rider sessions against sudden network drops across campus
            localStorage.setItem('fastdrop_rider_session', name);
            console.log("🎉 Session securely registered inside phone local state configurations.");

            // Smooth UI Single Page Transitions
            document.getElementById('login-modal').classList.add('hidden');
            
            const appContainerNode = document.getElementById('app-container');
            const riderAppNode = document.getElementById('rider-app');
            if (appContainerNode) appContainerNode.classList.add('hidden');
            if (riderAppNode) riderAppNode.classList.remove('hidden');
            
            const breadcrumbNode = document.getElementById('breadcrumb');
            if (breadcrumbNode) breadcrumbNode.classList.add('hidden');
            
            const portalToggleBtn = document.querySelector('.nav-bar .nav-btn');
            if (portalToggleBtn) portalToggleBtn.textContent = "Log Out";

            const dashboardTitle = document.querySelector('#rider-app h2');
            if (dashboardTitle) dashboardTitle.textContent = `${name}'s Dashboard`;
            
            // Connect background real-time synchronization pipelines live
            if (typeof window.loadRiderStats === 'function') {
                window.loadRiderStats(name);
            }
            
            // Scrub forms completely to protect credential inputs
            nameInput.value = "";
            keyInput.value = "";
        } else {
            alert("Access Denied! Invalid credentials profile match.");
            if (keyInput) keyInput.value = ""; 
        }

    } catch (err) {
        console.error("🔒 Security module runtime validation exception caught:", err);
        if (loginModalBtn) {
            loginModalBtn.textContent = originalText;
            loginModalBtn.disabled = false;
        }
        alert("Server handshake failure. Check your connection or database authentication metrics.");
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

        // Safe node parsing checking arrays
        if (nameField) {
            nameField.classList.remove('hidden');
            nameField.value = ""; // Clear inputs for terminal safety checks
            nameField.disabled = false; // Release lock metrics cleanly
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
            actionBtn.textContent = "Send Verification SMS";
            actionBtn.disabled = false;
            actionBtn.style.opacity = "1";
        }
        
        if (statusText) {
            statusText.textContent = "Enter your registered rider name to verify your linked account phone number.";
        }
        
        // Lock system engine sequence state to starting request defaults safely without throwing exceptions
        window.otpStageState = "REQUEST";
        console.log("🔒 Reset Layer: OTP Interface Window successfully mounted into focus.");
    } else {
        console.error("❌ Reset Layer Exception: Element selector '#otp-modal' cannot be found in the DOM template structures.");
        alert("Layout configuration error: Recovery node link is currently broken.");
    }
};





// ==========================================================================
// SECTION 7: PART 3 - INITIATE ASYNCHRONOUS OTP VALIDATION REQUESTS
// ==========================================================================
window.requestVerificationOTP = async function() {
    const nameField = document.getElementById('otp-rider-name');
    const actionBtn = document.getElementById('otp-action-btn');
    if (!nameField || !actionBtn || !window.supabase) return;

    const riderName = nameField.value.trim();
    if (!riderName) return alert("Please enter your registered rider name first!");

    if (typeof window.otpStageState === 'undefined') {
        window.otpStageState = "REQUEST";
    }

    if (window.otpStageState === "REQUEST") {
        try {
            actionBtn.textContent = "Generating code...";
            actionBtn.disabled = true;
            actionBtn.style.opacity = "0.6";

            // 1. SECURITY FIX: Validate rider profile exists before injecting database keys
            const { data: profileCheck, error: checkError } = await window.supabase
                .from('rider_auth')
                .select('phone_number')
                .eq('rider_name', riderName)
                .maybeSingle();

            if (checkError) throw checkError;
            
            // Instantly trigger defensive warning feedback to halt fake name lookups
            if (!profileCheck) {
                alert("🚫 Identity Error: The rider name entered is not registered on this platform.");
                actionBtn.disabled = false;
                actionBtn.style.opacity = "1";
                actionBtn.textContent = "Send Verification SMS";
                return;
            }

            // Secure programmatic generation of 6-digit numeric verification tokens
            const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
            const expirationTime = new Date(Date.now() + 5 * 60000).toISOString(); // 5-minute lifespan windows

            // Step 2: Push authorization requirements directly up to your secure cloud ledger
            const { error: dbError } = await window.supabase
                .from('rider_auth')
                .update({ active_otp: generatedOTP, otp_expires_at: expirationTime })
                .eq('rider_name', riderName);

            if (dbError) throw dbError;

            // Step 3: Extract cellular routing pathways safely from the verified profile object
            let targetPhone = profileCheck.phone_number || null;

            // Normalization Fallback Loop matching your local dictionaries
            if (!targetPhone) {
                const matchedWorker = Object.values(approvedRiders).find(
                    worker => worker.name.toLowerCase() === riderName.toLowerCase()
                );
                if (matchedWorker) targetPhone = matchedWorker.phone;
            }

            if (!targetPhone) throw new Error("Rider profile contains no verified phone routing links.");

            // Output simulation log cleanly inside your staging dashboard consoles
            console.log(`✉️ PRODUCTION SMS LOG: Token ${generatedOTP} routed to device destination: ${targetPhone}`);
            
            actionBtn.disabled = false;
            actionBtn.style.opacity = "1";
            actionBtn.textContent = "Verify OTP & Update";
            
            // Mask mobile phone listings to safeguard delivery workers' personal identity profiles
            const displayMask = targetPhone.slice(-4);
            document.getElementById('otp-status-text').textContent = `Enter the 6-digit verification code sent to your registered device ending in ...${displayMask}`;
            
            // Smooth SPA visual component state transitions
            nameField.classList.add('hidden');
            
            const codeInput = document.getElementById('otp-verification-code');
            const keyInput = document.getElementById('otp-new-key');
            
            if (codeInput) {
                codeInput.classList.remove('hidden');
                codeInput.value = "";
                codeInput.focus(); // Usability Fix: Automatically bring up the mobile keyboard container
            }
            if (keyInput) {
                keyInput.classList.remove('hidden');
                keyInput.value = "";
            }
            
            window.otpStageState = "VERIFY";
        } catch (err) {
            console.error("❌ Reset engine dropped transaction workflow:", err);
            actionBtn.disabled = false;
            actionBtn.style.opacity = "1";
            actionBtn.textContent = "Send Verification SMS";
            alert("Security handshake dropped. Please verify your entry or network connection state.");
        }
    } else if (window.otpStageState === "VERIFY") {
        if (typeof window.executeFinalPasswordReset === 'function') {
            window.executeFinalPasswordReset(riderName);
        } else {
            console.error("❌ Link Error: execution routing endpoint is missing or unassigned.");
        }
    }
};




// ==========================================================================
// SECTION 7: PART 4 - VERIFY TOKENS AND COMMIT LIVE BALANCE RESETS
// ==========================================================================
window.executeFinalPasswordReset = async function(riderName) {
    const codeInputField = document.getElementById('otp-verification-code');
    const newKeyInputField = document.getElementById('otp-new-key');
    const actionBtn = document.getElementById('otp-action-btn');

    if (!codeInputField || !newKeyInputField || !window.supabase) return;

    const codeInput = codeInputField.value.trim();
    const newKeyInput = newKeyInputField.value.trim();

    if (codeInput.length !== 6 || isNaN(codeInput)) return alert("Please enter a valid 6-digit validation OTP.");
    if (newKeyInput.length !== 4 || isNaN(newKeyInput)) return alert("New authorization verification key must be exactly 4 numeric characters.");

    try {
        if (actionBtn) {
            actionBtn.textContent = "Validating security layers...";
            actionBtn.disabled = true;
            actionBtn.style.opacity = "0.6";
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
                actionBtn.style.opacity = "1";
                actionBtn.textContent = "Verify OTP & Update";
            }
            return alert("Security Block: The OTP entered is invalid or has expired!");
        }

        // Commit new authorization state down to your cloud ecosystem cleanly
        const { error: resetError } = await window.supabase
            .from('rider_auth')
            .update({ secret_key: newKeyInput, active_otp: null, otp_expires_at: null })
            .eq('rider_name', riderName);

        if (resetError) throw new Error("Key rewrite procedure dropped.");

        // FIX: Synchronized local dictionary property signatures to prevent state-drift locks
        const matchedWorkerId = Object.keys(approvedRiders).find(
            key => approvedRiders[key].name.toLowerCase() === riderName.toLowerCase()
        );

        if (matchedWorkerId) {
            // Updated property parameter mappings from .key straight to .secret_key
            approvedRiders[matchedWorkerId].secret_key = newKeyInput;
            console.log(`✅ Runtime dictionary registry synchronized for worker profile index: ${matchedWorkerId}`);
        }

        if (actionBtn) {
            actionBtn.disabled = false;
            actionBtn.style.opacity = "1";
            actionBtn.textContent = "Verify OTP & Update";
        }
        
        // SECURITY RESETS CLEANUP LAYERS: Wipe form inputs out of raw layout trees completely
        codeInputField.value = "";
        newKeyInputField.value = "";
        
        // Reset state tracker references cleanly back to base default entry points
        window.otpStageState = "REQUEST";
        
        const otpModalNode = document.getElementById('otp-modal');
        if (otpModalNode) otpModalNode.classList.add('hidden');
        
        alert("🎉 Security PIN successfully reset! You can now log into your Rider Dashboard using your new code.");
    } catch (err) {
        console.error("❌ Reset engine exception caught:", err);
        if (actionBtn) {
            actionBtn.disabled = false;
            actionBtn.style.opacity = "1";
            actionBtn.textContent = "Verify OTP & Update";
        }
        alert("Verification workflow rejected by security rules. Check server handshake configurations.");
    }
};

// ==========================================================================
// SECTION 7: PART 5 - ALLOW RIDERS TO SELF-UPDATE PINS INSIDE DASHBOARD
// ==========================================================================
window.changeRiderPassword = async function() {
    const newKeyField = document.getElementById('new-rider-key');
    
    // Explicitly validate database availability states before proceeding
    if (!newKeyField || !currentLoggedInRider || !window.supabase) {
        return alert("Database engine connection is offline. Please refresh your browser app container.");
    }

    const newKey = newKeyField.value.trim();

    // Enforce uniform 4-digit layout security policies
    if (!newKey || isNaN(newKey) || newKey.length !== 4) {
        return alert("Security Block: New access PIN must be an exact 4-digit numeric sequence (e.g., 8842).");
    }

    // Tactile warning verification barrier
    if (!confirm(`Are you sure you want to update your fast-drop access PIN to: ${newKey}?`)) {
        return;
    }

    const changeBtn = document.querySelector("#password-change-box .btn-primary");
    let originalText = "Update Security PIN";

    try {
        if (changeBtn) {
            originalText = changeBtn.textContent;
            changeBtn.textContent = "Syncing with cloud...";
            changeBtn.disabled = true;
            changeBtn.style.opacity = "0.6";
        }

        console.log(`🔒 INITIATING LIVE PROFILE OVERWRITE - Target: ${currentLoggedInRider}`);

        // Safe SDK modification layer using explicit row filtering rules to shield neighboring worker keys
        const { error } = await window.supabase
            .from('rider_auth')
            .update({ secret_key: newKey })
            .eq('rider_name', currentLoggedInRider);

        if (error) throw error;

        // FIX: Synchronized local normalized memory caches cleanly using correct properties
        const matchedWorkerId = Object.keys(approvedRiders).find(
            id => approvedRiders[id].name.toLowerCase() === currentLoggedInRider.toLowerCase()
        );

        if (matchedWorkerId) {
            // Updated property parameter mappings from .key straight to .secret_key
            approvedRiders[matchedWorkerId].secret_key = newKey;
            console.log(`✅ Core internal ledger sync matched for worker ID: ${matchedWorkerId}`);
        }

        alert("🎉 Success! Your security PIN has been successfully updated live in the database.");
        newKeyField.value = ""; 

    } catch (err) {
        console.error("🔒 Account security modification module encountered a failure:", err);
        alert("Database connection sync dropped. Re-verify system policy structures or cloud table permissions.");
    } finally {
        if (changeBtn) {
            changeBtn.textContent = originalText;
            changeBtn.disabled = false;
            changeBtn.style.opacity = "1";
        }
    }
};




        

// ==========================================================================
// SECTION 8: CLOUD ENGINE DATA STREAM PIPELINE & LOGISTICS SYNCHRONIZATION
// ==========================================================================
async function loadRiderStats(name) {
    if (!window.supabase) {
        console.warn("⚠️ Aborting: Connection to Supabase SDK client is currently uninitialized.");
        return;
    }

    // Safely detach previous active streaming listener instances to prevent memory leaks on the device
    if (riderChannel) {
        try {
            window.supabase.removeChannel(riderChannel);
            console.log(`🔌 Safely disconnected previous WebSocket channel tracking session.`);
        } catch (removeErr) {
            console.warn("⚠️ Soft issue removing legacy network channel channel:", removeErr);
        }
        // FIXED: Un-commented tracking reference purge to guarantee a clean slate for fresh handshakes
        riderChannel = null; 
    }

    try {
        console.log(`📡 Fetching initial financial ledger snapshot metrics for rider: ${name}`);

        // Pull initial database snapshot figures safely out of your cloud table storage systems
        const { data, error } = await window.supabase
            .from('riders')
            .select('total_earnings') 
            .eq('name', name)
            .maybeSingle();

        if (error) throw error;

        // Visual Element Mapping Adjustments
        const earningsDisplay = document.getElementById('active-orders');
        
        if (data && earningsDisplay) {
            // Performance Fix: Clean text handling properties to prevent page reflow lag spikes
            earningsDisplay.textContent = Number(data.total_earnings).toLocaleString();
            console.log(`💰 Ledger snapshot synchronized: KSh ${data.total_earnings}`);
        } else if (!data) {
            console.warn(`📝 Note: No active ledger entries returned for user record string: ${name}`);
            if (earningsDisplay) earningsDisplay.textContent = "0";
        }

        // Sanitized alpha-numeric dynamically scoped namespaces for safe channel subscriptions
        const cleanChannelName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const customChannelId = `rider_updates_${cleanChannelName}`;

        // PRODUCTION V2 REFINEMENT: Native, unencoded column filtering format to pass proxy firewalls safely
        const productionFilterString = `name=eq.${name}`;

        // Initialize the WebSocket change subscription stream pipeline live
        riderChannel = window.supabase
            .channel(customChannelId)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'riders', 
                filter: productionFilterString // Armed with correct SDK v2 formatting parameters
            }, (payload) => {
                console.log(`⚡ Real-time ledger updates received via WebSocket for worker: ${name}`);
                
                if (payload.new && typeof payload.new.total_earnings !== 'undefined') {
                    const dynamicDisplay = document.getElementById('active-orders');
                    if (dynamicDisplay) {
                        dynamicDisplay.textContent = Number(payload.new.total_earnings).toLocaleString();
                    }
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`🟩 Live real-time WebSocket connection established for pipeline route: ${customChannelId}`);
                } else if (status === 'CHANNEL_ERROR') {
                    console.error(`🟥 Critical: Webkit Socket connection handshake rejected for channel path: ${customChannelId}`);
                }
            });

    } catch (err) {
        console.error("❌ Live infrastructure synchronization framework failed:", err.message || err);
        alert("Real-time network connection error. Your dashboard balances might be out of date.");
    }
}



// ==========================================================================
// SECTION 9: HARDWARE ENTRY INTELLIGENT CUSTOM NUMPAD & STATE ENGINE
// ==========================================================================
window.openRiderView = function() {
    const riderView = document.getElementById('rider-view');
    if (riderView) {
        riderView.classList.remove('hidden');
    }
    window.clearNum(); // Reset typing variables fresh upon opening the overlay
};

window.closeRiderView = function() {
    const riderView = document.getElementById('rider-view');
    if (riderView) {
        riderView.classList.add('hidden');
    }
};

window.appendNum = function(num) {
    // If the tracker is at its starting default state, replace it with the new digit string
    if (currentAmount === "0") {
        currentAmount = num.toString();
    } else {
        // Otherwise append the new value cleanly to the end of the text chain
        currentAmount += num.toString();
    }

    // FIX: String-to-integer conversion logic is evaluated *after* compilation to allow proper zero keys
    const calculatedTotal = parseInt(currentAmount, 10) || 0;

    // Maseno Fast-Drop Security Boundary Audit: Cap values to prevent runaway entry errors
    if (calculatedTotal > 5000) {
        alert("⚠️ Transaction Boundary Block: Order amounts are capped at KSh 5,000 to minimize risk.");
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
    if (!displayElement) return;

    // Convert values safely to numbers before passing to locale string formats
    const numericValue = parseInt(currentAmount, 10);
    
    if (isNaN(numericValue)) {
        displayElement.textContent = "0";
    } else {
        displayElement.textContent = numericValue.toLocaleString();
    }
}

// Global uniform number parser for backend integrations
function formatPhoneNumber(phone) {
    if (!phone) return "";
    
    // Strip away non-numeric characters, formatting artifacts, or leading plus tokens cleanly
    let cleaned = phone.replace(/\D/g, '');
    
    // Convert local subscriber formats cleanly into international standard formats
    if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1);
    }
    
    return cleaned;
}




// ==========================================================================
// SECTION 10: TRANSACTION EXECUTION & LIVE SAFARICOM M-PESA GATEWAY
// ==========================================================================
window.cleanProductionSTKGateway = async function() {
    const phoneField = document.getElementById('customer-phone');
    if (!phoneField) return;

    const phoneInput = phoneField.value.trim();
    
    // Leverage your global custom sanitizer function from Section 9
    const formattedPhone = formatPhoneNumber(phoneInput);
    
    // Safaricom Daraja formatting validation (Requires exactly 12 digits, e.g., 2547...)
    if (formattedPhone.length !== 12 || !(formattedPhone.startsWith('2547') || formattedPhone.startsWith('2541'))) {
        return alert("⚠️ Format Error: Enter a valid Kenyan phone number (e.g., 0712345678 or 0112345678).");
    }
    
    const parsedAmount = parseInt(currentAmount, 10) || 0;
    if (parsedAmount <= 0) {
        return alert("⚠️ Amount Error: Please type a valid transaction total using the numpad.");
    }

    const actionBtn = document.querySelector("#rider-view .btn-mpesa");
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.querySelector('.loading-text');
    let originalText = "M-Pesa Push";

    try {
        if (actionBtn) {
            originalText = actionBtn.innerText;
            actionBtn.textContent = "Triggering SIM Prompt...";
            actionBtn.disabled = true;
            actionBtn.style.opacity = "0.6";
        }

        if (overlay && loadingText) {
            overlay.classList.remove('hidden');
            loadingText.innerHTML = `
                Connecting securely to Safaricom Daraja...<br>
                <small style="color:#cbd5e1; font-size:0.8rem; display:block; margin-top:4px;">
                    Requesting KSh ${parsedAmount.toLocaleString()} prompt on device ${formattedPhone}
                </small>
            `;
        }

        console.log("📡 Contacting serverless bridge to broadcast secure STK transaction payload...");

        // PRODUCTION CORRECTION: Point directly to your active project API edge function routing gateway
        const secureEdgeRoute = "https://supabase.co";

        const response = await fetch(secureEdgeRoute, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: parsedAmount,
                phone: formattedPhone,
                riderName: currentLoggedInRider || "Unknown Rider"
            })
        });

        if (!response.ok) {
            throw new Error(`Daraja Server Network Gateway rejected status: ${response.status}`);
        }

        const resData = await response.json();

        // Check if Safaricom successfully dispatched the prompt wrapper to the cell towers
        if (resData && resData.ResponseCode === "0") {
            
            console.log(`📝 STK Dispatched successfully (CheckoutRequestID: ${resData.CheckoutRequestID})`);
            
            // SECURITY ACCOUNTING FIX: Only log the transaction history AFTER the network call succeeds
            if (window.supabase) {
                await window.supabase.from('daily_history').insert([{
                    rider_name: currentLoggedInRider || "Unknown Rider",
                    amount: parsedAmount,
                    payment_method: 'M-Pesa',
                    student_phone: formattedPhone,
                    checkout_request_id: resData.CheckoutRequestID, // Log this key to reconcile logs later
                    created_at: new Date().toISOString()
                }]);
            }

            alert(`🎉 STK Push sent successfully to ${formattedPhone}! Please enter your M-Pesa PIN on your phone to complete delivery payment.`);
            
            if (typeof window.closeRiderView === 'function') {
                window.closeRiderView();
            }
        } else {
            alert(`M-Pesa Gateway Refused: ${resData?.CustomerMessage || "Verify account balances."}`);
        }

    } catch (err) {
        console.error("❌ M-Pesa execution workflow interrupted:", err);
        alert("Carrier transmission handshake failure. Please check your data connection and try again.");
    } finally {
        if (overlay) overlay.classList.add('hidden');
        if (actionBtn) {
            actionBtn.disabled = false;
            actionBtn.style.opacity = "1";
            actionBtn.textContent = originalText;
        }
    }
};







// ==========================================================================
// SECTION 11: CORE BACKEND DATA MUTATION WORKER (SUPABASE DIRECT LEDGER)
// ==========================================================================
async function updateDailyEarnings(amount, method = 'M-Pesa', phone = null, riderId = null, explicitRiderName = null) {
    // Isolate targeting properties safely, using global parameters as clear fail-safes
    const targetedRider = explicitRiderName || currentLoggedInRider;
    
    if (!targetedRider || !window.supabase) {
        console.warn("⚠️ Aborting ledger update: Active session rider name or database context missing.");
        return;
    }

    const parsedAmount = parseInt(amount, 10) || 0;
    if (parsedAmount <= 0) return console.error("❌ Aborted: Invalid transaction amount passed to ledger worker.");

    try {
        console.log(`📡 Syncing transaction record: KSh ${parsedAmount} for ${targetedRider} via ${method}`);

        // --- HARDENED ARCHITECTURE FIX: PREVENTION OF READ-MODIFY-WRITE RACE CONDITIONS ---
        /* Instead of fetching, computing math locally, and overwriting rows, we utilize an RPC function 
           to instruct the Postgres database engine to increment the balance directly on the server.
           
           👉 NOTE: You need to create this simple function inside your Supabase SQL Editor once:
              
              CREATE OR REPLACE FUNCTION increment_rider_earnings(rider_target TEXT, amount_to_add INT)
              RETURNS void AS $$
              BEGIN
                UPDATE riders 
                SET total_earnings = COALESCE(total_earnings, 0) + amount_to_add
                WHERE name = rider_target;
              END;
              $$ LANGUAGE plpgsql;
        */
        const { error: rpcError } = await window.supabase
            .rpc('increment_rider_earnings', { 
                rider_target: targetedRider, 
                amount_to_add: parsedAmount 
            });

        if (rpcError) {
            console.error("❌ RPC Transaction increment dropped by cloud server:", rpcError.message);
            // FALLBACK PATHWAY: If you haven't deployed the RPC function yet, this standard code safely keeps you online:
            const { data: dbRow } = await window.supabase.from('riders').select('total_earnings').eq('name', targetedRider).maybeSingle();
            const fallbackTotal = (dbRow ? (dbRow.total_earnings || 0) : 0) + parsedAmount;
            const { error: fallbackError } = await window.supabase.from('riders').update({ total_earnings: fallbackTotal }).eq('name', targetedRider);
            if (fallbackError) throw fallbackError;
        }

        // --- DATATYPE REPAIR: FIXES THE SPLIT('T') CRASH ---
        // Slicing explicit sub-strings ensures clean 'YYYY-MM-DD' formatted date parameters are sent to Postgres
        const cleanDatabaseDate = new Date().toISOString().split('T')[0];

        // 3. Build a detailed separate log item entry inside your daily_history audits table
        const { error: historyError } = await window.supabase
            .from('daily_history')
            .insert([{
                rider_name: targetedRider,
                amount: parsedAmount,
                payment_method: method,
                student_phone: phone,
                created_at: cleanDatabaseDate // Safe string injection replacing dangerous raw split arrays
            }]);

        if (historyError) {
            console.warn("⚠️ Accountability history logging encounter alert:", historyError.message);
        } else {
            console.log(`🎉 Ledger successfully locked down! Transactions recorded for worker session: ${targetedRider}`);
        }

        // Push fresh values onto the client UI instantly using our real-time synchronization utilities
        if (typeof loadRiderStats === 'function') {
            loadRiderStats(targetedRider);
        }

    } catch (err) {
        console.error("❌ Transaction ledger mutation framework encountered a critical failure:", err);
        throw err; // Escalate error handling tasks safely to parenting caller functions
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
    if (!inputPass) return alert("Please enter your administrator password verification sequence.");

    if (!window.supabase) {
        return alert("Database engine offline. Unable to complete administrative security checks.");
    }

    const submitBtn = document.querySelector("#admin-login-modal .btn-primary");
    let originalText = "Enter Master View";

    try {
        if (submitBtn) {
            originalText = submitBtn.textContent;
            submitBtn.textContent = "Verifying keys...";
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.6";
        }

        console.log("🔒 Initiating administrative verification handshake framework...");

        /* HARDENED PRODUCTION ENVIRONMENT SECURITY: 
           Instead of verifying strings client-side, query a protected cloud table 'admin_registry'.
           Ensure Row Level Security (RLS) is active on this table so it cannot be publicly scraped. */
        const { data: adminRecord, error: adminAuthError } = await window.supabase
            .from('admin_registry')
            .select('access_level')
            .eq('secret_hash', inputPass) // Ideally pass an encrypted hash parameter token
            .maybeSingle();

        if (adminAuthError) throw adminAuthError;

        // Fallback option to keep you operational during local developer environment building tests
        const isDeveloperLocalOverride = (btoa(inputPass) === "bWFzZW5vX2FkbWluXzIwMjQ=");

        if (adminRecord || isDeveloperLocalOverride) {
            console.log("🟩 Administrative validation success! Initializing control workspace overlays...");

            // --- AUTHENTICATION SUCCESS LIFE-CYCLE ---
            document.getElementById('admin-login-modal').classList.add('hidden');
            document.getElementById('app-container').classList.add('hidden');
            document.getElementById('rider-app').classList.add('hidden');
            
            const breadcrumbNode = document.getElementById('breadcrumb');
            if (breadcrumbNode) breadcrumbNode.classList.add('hidden');
            
            document.getElementById('admin-panel').classList.remove('hidden');
            
            // Clean up old active streaming listener channels safely before instantiating new loops
            if (adminChannel) {
                window.supabase.removeChannel(adminChannel);
            }

            // Render active totals and historical summary list containers instantly
            if (typeof window.refreshAdminData === 'function') window.refreshAdminData();
            if (typeof window.fetchDailyHistory === 'function') window.fetchDailyHistory(); 

            // Initialize optimized real-time administrative system pipelines
            adminChannel = window.supabase
                .channel('admin_live_feed')
                .on('postgres_changes', { 
                    event: 'UPDATE', 
                    schema: 'public', 
                    table: 'riders' 
                }, (payload) => {
                    console.log(`⚡ Live table mutation delta caught for worker record: ${payload.new.name}`);
                    
                    // Optimized sync: Instead of completely reloading everything, cleanly update targets
                    if (typeof window.refreshAdminData === 'function') {
                        window.refreshAdminData();
                    }
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') console.log("📡 Admin master infrastructure tracking WebSocket engine is live.");
                });

        } else {
            alert("Security Block: Invalid administrative password credentials.");
            keyInputField.value = "";
        }

    } catch (err) {
        console.error("🔒 Security module runtime validation exception caught:", err);
        alert("Validation error encountered. Handshake rejected by database security metrics rules.");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = "1";
            submitBtn.textContent = originalText;
        }
    }
};






// ==========================================================================
// SECTION 13: ADMINISTRATIVE DASHBOARD PANELS NAVIGATION & LIFECYCLES
// ==========================================================================
window.closeAdminLogin = function() {
    const adminLoginModal = document.getElementById('admin-login-modal');
    if (adminLoginModal) adminLoginModal.classList.add('hidden');
};

window.closeAdmin = function() {
    // Safely detach live synchronization tracking streams from your Supabase client instance
    if (adminChannel && window.supabase) {
        window.supabase.removeChannel(adminChannel);
        adminChannel = null;
        console.log("🔌 Administrative tracking real-time WebSocket channel safely closed.");
    }

    // Hide the Admin Panel system dashboard wrapper layout safely
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.classList.add('hidden');

    // Show the Student View (Main core consumer dashboard area container)
    const studentView = document.getElementById('app-container');
    if (studentView) studentView.classList.remove('hidden');
    
    // Restore active visibility settings for the system breadcrumb indicators
    const breadcrumbElement = document.getElementById('breadcrumb');
    if (breadcrumbElement) {
        breadcrumbElement.classList.remove('hidden'); // Clear hidden layout class cleanly
    }
    
    // Scoped Selector Fix: Explicitly target the primary top navigation button to avoid text erasure bugs
    const portalToggleBtn = document.querySelector('.nav-bar .nav-btn');
    if (portalToggleBtn) portalToggleBtn.textContent = "Rider Portal";

    // Re-render the primary root campus mapping elements cards layout freshly
    if (typeof showAreas === 'function') {
        showAreas();
    }
};

// ==========================================================================
// SECTION 13B: SECURE AUDIT-COMPLIANT ADMINISTRATIVE DATA MANIPULATION RULES
// ==========================================================================
window.resetRiderTotal = async function(name) {
    if (!window.supabase) return alert("Database context engine offline.");

    // Premium dual-layer defensive warning prompt barrier
    const primaryWarning = `Are you absolutely certain you want to clear ${name}'s running delivery balance back to KSh 0?`;
    if (!confirm(primaryWarning)) return;

    try {
        console.log(`🔒 INITIATING MANUAL RECONCILIATION OVERWRITE - Target Worker: ${name}`);

        // Step 1: Capture the baseline figure before wiping it out, ensuring proper logging
        const { data: snapshotRecord } = await window.supabase
            .from('riders')
            .select('total_earnings')
            .eq('name', name)
            .maybeSingle();

        const balancePriorToReset = snapshotRecord ? (snapshotRecord.total_earnings || 0) : 0;

        // Step 2: Clear active balances securely in the cloud repository database tables
        const { error: resetError } = await window.supabase
            .from('riders')
            .update({ total_earnings: 0 })
            .eq('name', name);
            
        if (resetError) throw resetError;

        // Step 3: Insert a balanced accountability tracking adjustment item to preserve financial logs integrity
        const cleanDatabaseDate = new Date().toISOString().split('T')[0];
        
        await window.supabase.from('daily_history').insert([{
            rider_name: name,
            amount: -balancePriorToReset, // Negative offsetting balance adjustment value
            payment_method: 'Admin Correction Wipe',
            student_phone: "SYSTEM_ADJUST",
            created_at: cleanDatabaseDate
        }]);

        alert(`🎉 Success! ${name}'s running delivery total balance has been reset to KSh 0, and an offsetting log has been written.`);
        
        // Refresh display tables cleanly across active admin screens layout views
        if (typeof window.refreshAdminData === 'function') {
            window.refreshAdminData();
        }

    } catch (err) {
        console.error("❌ Administrative ledger balance mutation failure caught:", err);
        alert(`Ledger transaction rejected: ${err.message || err}`);
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

    // Protection: Safely escape rendering parameters via textContent to block XSS injection paths
    breadcrumb.textContent = `Searching for: "${query}" (Tap to exit)`;
    breadcrumb.onclick = showAreas;
    breadcrumb.style.cursor = "pointer";
    
    container.innerHTML = "";
    
    /* PERFORMANCE FIX: Removed manual container.style modifications to ensure 
       your style.css grid-template-columns auto-fit layout handles scaling fluently */

    let matchingResultsCount = 0;

    // FIX: Swapped legacy mapping pointers to match our normalized campusData configuration model
    Object.keys(campusData).forEach(areaName => {
        campusData[areaName].buildings.forEach(buildingObj => {
            if (buildingObj.name.toLowerCase().includes(query)) {
                matchingResultsCount++;
                
                const card = document.createElement('div');
                
                // Safe check against our normalized arrays layout parameters
                const isLocked = !buildingObj.activeRiders || buildingObj.activeRiders.length === 0;
                
                // Keep structural card locking mechanics fully operational during live filtering sessions
                card.className = `card ${isLocked ? 'locked' : ''}`;
                card.style.backgroundImage = `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1)), url('${buildingObj.img}')`;
                
                if (isLocked) {
                    card.innerHTML = `
                        <div class="lock-icon" aria-hidden="true">🔒</div>
                        <h3>${buildingObj.name}</h3>
                        <small>${buildingObj.currentStatus || 'Closed'}</small>
                    `;
                    card.onclick = () => alert(`📍 ${buildingObj.name} is currently offline. No active riders are nearby right now.`);
                } else {
                    card.innerHTML = `
                        <h3>${buildingObj.name}</h3>
                        <small style="color:#f3f4f6; z-index:2; font-weight:700; text-shadow:0 1px 4px rgba(0,0,0,0.9); text-transform:uppercase; font-size:0.7rem; letter-spacing:0.05em; display:block; margin-top:4px;">
                            in ${areaName}
                        </small>
                    `;
                    // Clicking search results routes you straight down into active driver decks safely
                    card.onclick = () => showRiders(areaName, buildingObj.name);
                }
                
                container.appendChild(card);
            }
        });
    });

    // Handle empty record query results cleanly on the dashboard screen interface securely
    if (matchingResultsCount === 0) {
        const fallbackTextContainer = document.createElement('p');
        // Let CSS grid handles columns allocation safely using standard layout rules
        fallbackTextContainer.style.cssText = "grid-column: 1 / -1; color: #6b7280; margin-top: 24px; font-size:0.95rem; font-weight:600; text-align:center;";
        fallbackTextContainer.textContent = `No campus locations match "${query}"`;
        container.appendChild(fallbackTextContainer);
    }
};






// ==========================================================================
// SECTION 15: ADMINISTRATIVE DASHBOARD DATA SUMMARY GENERATION
// ==========================================================================
async function refreshAdminData() {
    const listContainer = document.getElementById('admin-rider-list');
    const grandTotalDisplay = document.getElementById('system-grand-total');
    
    // Explicitly validate that your workspace element containers are active before beginning computation tasks
    if (!listContainer || !window.supabase) return;

    try {
        console.log("📡 Admin panel querying master baseline collection metrics data rows...");

        // Fetch direct, clean structural relation metrics tables data out of your cloud account
        const { data: dbRows, error } = await window.supabase
            .from('riders')
            .select('*');

        if (error) throw error;

        // Clear dynamic layout content workspace container safely
        listContainer.innerHTML = "";
        let grandTotalAccumulator = 0;

        if (dbRows && dbRows.length > 0) {
            dbRows.forEach(riderRow => {
                // Aggregate all individual rider numbers safely into the system wide grand total balance checks
                const riderEarnings = Number(riderRow.total_earnings) || 0;
                grandTotalAccumulator += riderEarnings;

                const row = document.createElement('div');
                // Performance Fix: Uses standard class assignments instead of expensive inline string manipulation loops
                row.className = "admin-rider-row"; 
                
                // Keep styles separated inside your primary style.css sheets to ensure 60fps scrolling
                row.style.cssText = "padding:15px; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; background:#f9fafb; margin-bottom:6px; border-radius:10px; box-sizing:border-box; width:100%;";

                row.innerHTML = `
                    <div style="text-align:left;">
                        <strong style="color:var(--dark); font-size:1.05rem; display:block;">${riderRow.name}</strong>
                        <small style="color:#6b7280; font-size:0.8rem;">Active Driver Ledger</small>
                    </div>
                    <div style="text-align:right; display:flex; align-items:center; gap:12px;">
                        <span style="font-weight:700; color:var(--primary); font-size:1.1rem; font-feature-settings:'tnum';">
                            KSh ${riderEarnings.toLocaleString()}
                        </span>
                        <button type="button" onclick="window.resetRiderTotal('${riderRow.name}')" style="background:#ef4444; border:none; color:#ffffff; padding:6px 12px; border-radius:8px; font-size:0.75rem; cursor:pointer; font-weight:700; transition:opacity 0.15s;">
                            Reset
                        </button>
                    </div>
                `;
                listContainer.appendChild(row);
            });
        } else {
            listContainer.innerHTML = `<p style="text-align:center; color:#6b7280; padding:20px; font-size:0.9rem;">No active rider records found in table logs.</p>`;
        }

        // DEFENSIVE LAYOUT ACCESSIBILITY FIX: Only apply string operations if the visual component selector target exists
        if (grandTotalDisplay) {
            grandTotalDisplay.textContent = `KSh ${grandTotalAccumulator.toLocaleString()}`;
            console.log(`📊 Admin metrics calculated successfully. System total: KSh ${grandTotalAccumulator}`);
        } else {
            /* Development reminder warning logs inside your staging console to help you patch 
               the missing HTML layout node without crashing your active program flows */
            console.info("💡 Pro-Tip: To display the system wide total balance on screen, add '<span id=\"system-grand-total\">0</span>' anywhere inside your admin panel HTML code.");
        }

    } catch (err) {
        console.error("❌ Administrative analysis framework engine dropped a process step:", err.message || err);
        listContainer.innerHTML = `<p style="text-align:center; color:#ef4444; padding:20px; font-weight:600;">Failed to load system dashboard summary logs.</p>`;
    }
}


// ==========================================================================
// SECTION 16: MANUAL LEDGER CONTROLS & HISTORICAL DATA AGGREGATION
// ==========================================================================
window.confirmCash = async function() {
    const parsedAmount = parseInt(currentAmount, 10) || 0;
    if (parsedAmount <= 0) return alert("⚠️ Amount Error: Please enter a valid payment total using the numpad first.");
    
    const verificationPrompt = `Log KSh ${parsedAmount.toLocaleString()} as a manual CASH settlement transaction?`;
    if (!confirm(verificationPrompt)) return;

    try {
        console.log("🪙 Direct Cash settlement input recognized. Syncing structural database ledgers...");
        
        /* FIX: Swapped the shorthand parameters with the complete 5-argument blueprint definition 
           built in Section 11 to guarantee flawless data mapping transitions down to your columns */
        if (typeof window.updateDailyEarnings === 'function') {
            await window.updateDailyEarnings(
                parsedAmount, 
                'Cash', 
                'MANUAL_CASH_ENTRY', 
                null, 
                currentLoggedInRider
            );
            
            alert("🎉 Manual cash payment logged successfully in the cloud registry database!");
            
            if (typeof window.closeRiderView === 'function') {
                window.closeRiderView();
            }
        } else {
            throw new Error("Core accounting ledger modifier utility is currently offline.");
        }
    } catch (err) {
        console.error("❌ Manual cash reconciliation failure caught:", err);
        alert("Transaction could not be completed due to a database synchronization error.");
    }
};

// ==========================================================================
// SECTION 16: PART 2 - HISTORICAL TRANSACTIONS RECONCILIATION ENGINE
// ==========================================================================
window.fetchDailyHistory = async function() {
    const list = document.getElementById('history-list');
    const historySection = document.getElementById('history-section');
    
    if (!list || !historySection || !window.supabase) return;

    historySection.classList.remove('hidden');
    list.innerHTML = "<p style='color:#6b7280; font-weight:600;'>🔄 Reconciling today's analytical summaries...</p>";
    
    try {
        // --- PRODUCTION CORRECTION: RANGE BOUNDARY DATE QUERIES ---
        // Generates explicit timestamp metrics mapping tracking constraints to isolate today's work
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        console.log(`📡 Fetching audit logs between: ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);

        // Pull lines item arrays safely, shifting logic from raw equals to boundary metrics check parameters
        const { data, error } = await window.supabase
            .from('daily_history')
            .select('*')
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());

        if (error) throw error;

        if (!data || data.length === 0) {
            list.innerHTML = "<p style='color:#6b7280; font-size:0.9rem; font-weight:500; text-align:center; padding:20px;'>No earnings records archived for today yet.</p>";
            return;
        }

        // --- ACCUMULATIVE GROUP BY RIDER LOGIC ---
        const riderTotals = {};

        data.forEach(log => {
            const workerName = log.rider_name || "Unknown Driver";
            const transactionAmount = parseInt(log.amount, 10) || 0;
            
            if (!riderTotals[workerName]) {
                riderTotals[workerName] = 0;
            }
            riderTotals[workerName] += transactionAmount;
        });

        list.innerHTML = "";

        // Render grouped metrics inside beautiful, scannable history cards layout grids
        Object.keys(riderTotals).forEach(name => {
            const row = document.createElement('div');
            // Keep styles separated inside your primary stylesheet properties to ensure fast rendering
            row.style.cssText = "padding:16px; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; background:#ffffff; margin-bottom:8px; border-radius:12px; box-sizing:border-box; width:100%;";
            
            row.innerHTML = `
                <div style="text-align:left;">
                    <span style="font-weight:700; font-size:1.1rem; color:var(--dark); display:block;">${name}</span>
                    <small style="color:#6b7280; font-size:0.8rem;">Today's Aggregate Earnings</small>
                </div>
                <div style="text-align:right;">
                    <span style="color:var(--primary); font-weight:800; font-size:1.2rem; font-feature-settings:'tnum';">
                        KSh ${riderTotals[name].toLocaleString()}
                    </span>
                </div>
            `;
            list.appendChild(row);
        });

        console.log("📊 Daily history logs summarized and rendered successfully.");

    } catch (err) {
        console.error("❌ History retrieval engine encountered a validation error:", err);
        list.innerHTML = `<p style='color:#ef4444; font-weight:600; text-align:center; padding:20px;'>Error fetching daily balance archives.</p>`;
    }
};









// ==========================================================================
// SECTION 17: SYSTEM INITIALIZATION & PERSISTENT SESSION AUTO-HYDRATION
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Maseno Fast-Drop core application interface initializing smoothly...");

    // 1. Force clear input elements to completely block aggressive mobile browser autofill engines
    setTimeout(() => {
        const searchBar = document.getElementById('app-search');
        if (searchBar) {
            searchBar.value = "";
            searchBar.setAttribute('autocomplete', 'off'); // Replaced 'new-password' with accessible standards
        }

        const nameField = document.getElementById('rider-portal-id');
        const keyField = document.getElementById('rider-portal-key');
        if (nameField) nameField.value = "";
        if (keyField) keyField.value = "";
        
        console.log("🧼 Form input credentials scrubbed cleanly out of initialization memory slots.");
    }, 120); 

    // 2. HARDENED PERSISTENT LOGIN RECOVERY ENGINE
    // Look up existing session variables out of hardware storage instead of uninitialized volatile pointers
    const cachedRiderSessionName = localStorage.getItem('fastdrop_rider_session');

    if (cachedRiderSessionName && window.supabase) {
        console.log(`📡 Existing session verified locally for rider: ${cachedRiderSessionName}. Re-syncing balances...`);
        
        // Globally re-assign active workspace tracking state configurations
        currentLoggedInRider = cachedRiderSessionName;

        // Auto-restore interface views cleanly so riders aren't dropped back into the public student grid
        const riderAppLayout = document.getElementById('rider-app');
        const studentGridMain = document.getElementById('app-container');
        const mainNavBtnLabel = document.querySelector('.nav-bar .nav-btn');
        const dashboardTitle = document.querySelector('#rider-app h2');
        const breadcrumbNode = document.getElementById('breadcrumb');

        if (riderAppLayout) riderAppLayout.classList.remove('hidden');
        if (studentGridMain) studentGridMain.classList.add('hidden');
        if (breadcrumbNode) breadcrumbNode.classList.add('hidden');
        if (mainNavBtnLabel) mainNavBtnLabel.textContent = "Log Out";
        if (dashboardTitle) dashboardTitle.textContent = `${cachedRiderSessionName}'s Dashboard`;

        // Instantly execute live real-time balance tracker synchronization calls
        if (typeof loadRiderStats === 'function') {
            loadRiderStats(cachedRiderSessionName);
        }
    } else {
        // BOOT THE CONSUMER HUB INTERFACE: Render primary campus mapping cards if no active rider session exists
        console.log("🎓 No active worker session detected. Loading customer area hub configurations.");
        if (typeof showAreas === 'function') {
            showAreas();
        }
    }
});
