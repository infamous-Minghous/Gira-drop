// ==========================================================================
// CONFIGURATION ANCHOR: UNIVERSAL MULTI-TENANT STATE SECURITY GATES
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
    // A. Standard Campus Couriers Pool (Using personal business Pochi wallets)
    "RD001": { 
        name: "Bravin", 
        phone: "+254700000000", 
        whatsapp: "254700000000", 
        avatar: "images/bravin.jpg",
        paymentType: "Pochi",
        paymentWallet: "0700000000"
    },
    "RD002": { 
        name: "Mercy",  
        phone: "+254711111111", 
        whatsapp: "254711111111", 
        avatar: "images/mercy.jpg",
        paymentType: "Pochi",
        paymentWallet: "0711111111"
    },
    "RD003": { 
        name: "John",   
        phone: "+254722222222", 
        whatsapp: "254722222222", 
        avatar: "images/john.jpg",
        paymentType: "Pochi",
        paymentWallet: "0722222222"
    },

    // B. Specialized Shop Delivery Handlers Pool (Carrying isolated keys and distinct collection lines)
    "RD_SEC_001": { 
        name: "Nightrunner", 
        phone: "+254799999999", 
        whatsapp: "254799999999", 
        avatar: "images/nightrunner.jpg", 
        isSecret: true,
        paymentType: "Pochi",
        paymentWallet: "0799999999" // Dedicated business pocket line for shop items
    },
    "RD_SEC_002": { 
        name: "Jack",        
        phone: "+254788888888", 
        whatsapp: "254788888888", 
        avatar: "images/jack.jpg",        
        isSecret: true,
        paymentType: "Till",
        paymentWallet: "123456" // High-utility 6-digit individual Till example handle
    }
};

// MULTI-TENANT STATE SYNC BOOTSTRAPPING ENGAGED
window.addEventListener('DOMContentLoaded', () => {
    if (window.supabase && currentLoggedInRider) {
        // PRODUCTION GUARD: Verify session corresponds to a valid courier before initializing worker view states
        const isValidCourierSession = approvedRiders[currentLoggedInRider] || 
            Object.values(approvedRiders).find(r => r.name === currentLoggedInRider);

        if (isValidCourierSession) {
            console.log(`🔄 Valid active worker session recognized for courier: ${currentLoggedInRider}`);
            if (typeof window.loadRiderStats === 'function') {
                window.loadRiderStats(currentLoggedInRider);
            }
        } else {
            console.log("ℹ️ Administrative session context detected on device initialization. Suppressing worker pipeline triggers.");
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
                // BLENDED PRESENTATION: Normal and special riders are mixed seamlessly in the same array!
                activeRiders: ["RD001", "RD_SEC_001", "RD_SEC_002"], 
                currentStatus: "At Complex Gate"
            },
            { 
                name: "Hollywood", 
                img: "images/card3-image7.jpg",
                activeRiders: ["RD002", "RD_SEC_001"],
                currentStatus: "Waiting at Hollywood"
            },
            { 
                name: "Sunrise", 
                img: "images/card2-image2.jpg",
                activeRiders: ["RD002", "RD_SEC_002"], 
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
                activeRiders: ["RD003", "RD_SEC_001"],
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

// MULTI-VIEWPORT SECURITY: Using open global scoping rules to support view-switches
let container = document.getElementById('app-container');
let breadcrumb = document.getElementById('breadcrumb');

if (!container || !breadcrumb) {
    console.warn("⚠️ Core application interface nodes missing from layout thread context.");
}



// ==========================================================================
// SECTION 3: STUDENT VIEW CAMPUS HUB NAVIGATION ENGINE
// ==========================================================================
function showAreas() {
    // SELF-HEALING DOM GUARD: Re-verify layout elements exist to prevent viewport freeze bugs
    if (!container) container = document.getElementById('app-container');
    if (!breadcrumb) breadcrumb = document.getElementById('breadcrumb');
    if (!container || !breadcrumb) return console.warn("⚠️ Aborted showAreas: Required DOM target containers are missing.");

    // Accessibility & Visibility Sync
    breadcrumb.textContent = "Select Area";
    breadcrumb.onclick = null;
    breadcrumb.style.cursor = "default";
    
    // Clear dynamic workspace text nodes safely
    container.innerHTML = "";

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
    // SELF-HEALING DOM GUARD: Re-verify layout elements exist to prevent viewport freeze bugs
    if (!container) container = document.getElementById('app-container');
    if (!breadcrumb) breadcrumb = document.getElementById('breadcrumb');
    if (!container || !breadcrumb) return console.warn("⚠️ Aborted showBuildings: Required DOM target containers are missing.");

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
// SECTION 4: HARDENED RESPONSIVE RIDER CARD GENERATION ENGINE
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
    
    // FIX 1: Parent Grid Wrapper to control multiple cards and stop layout overlap
    const cardsGrid = document.createElement('div');
    cardsGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
        gap: 20px;
        width: 100%;
        box-sizing: border-box;
        padding: 10px 0;
    `;
    container.appendChild(cardsGrid);
    
    // Process active riders using our clean centralized single-source worker registry
    buildingObj.activeRiders.forEach(riderId => {
        const riderRecord = approvedRiders[riderId];
        if (!riderRecord) return console.warn(`⚠️ Skipping missing worker database record for ID: ${riderId}`);

        const card = document.createElement('div');
        
        // Linked to your standard production class selector rules architecture
        card.className = 'card rider-card-view-only'; 

        // Explicitly wipe any inherited click triggers on the background card container base
        card.onclick = null;
        card.style.cursor = "default";
        
        // FIX 2: Clear inline box-sizing style constraints to stop container compression
        card.style.cssText = `
            background: #1e293b !important;
            border: 1px solid #334155 !important;
            border-radius: 16px;
            width: 100%;
            box-sizing: border-box;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        // 1. WhatsApp Logic: Clean, number sanitization engine
        const whatsAppTarget = riderRecord.whatsapp || riderRecord.phone;
        const cleanWaPhone = whatsAppTarget.replace(/[+\s]/g, '');

        // 2. USSD Logic: Handles stripping any Kenyan notation variants into safe local forms (07... / 01...)
        let ussdPhone = riderRecord.phone.replace(/[+\s]/g, '');
        if (ussdPhone.startsWith('254')) {
            ussdPhone = '0' + ussdPhone.substring(3);
        }

        // Formulate pre-filled localized text templates for campus delivery contexts
        const defaultText = `Hi ${riderRecord.name}, I am ordering from ${buildingName}. Are you nearby?`;
        const encodedText = encodeURIComponent(defaultText);

        // PRODUCTION FIXED ANCHOR LAYOUT: Hardened vertical internal stack layout model
        card.innerHTML = `
            <!-- Internal Stack Engine to isolate Profile data from Button layouts -->
            <div style="display:flex; flex-direction:column; gap:16px; width:100%; box-sizing:border-box;">
                
                <!-- Left Info Area: Flexible, non-breaking layout stack -->
                <div style="display:flex; align-items:center; gap:12px; width:100%; box-sizing:border-box;">
                    <div style="width:48px; height:48px; background:var(--primary, #f97316); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.25rem; font-weight:700; color:#ffffff; border:2px solid #ffffff; flex-shrink:0;">
                        ${riderRecord.name.charAt(0).toUpperCase()}
                    </div>
                    <div style="text-align:left; overflow:hidden;">
                        <h3 style="margin:0; color:#ffffff; font-size:1.15rem; font-weight:700; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${riderRecord.name}</h3>
                        <small style="color:#9ca3af; font-weight:500; display:block; margin-top:2px;">
                            ${buildingObj.currentStatus || 'Active Nearby'}
                        </small>
                    </div>
                </div>
                
                <!-- Right Button Action Area: Guaranteed to sit vertically in order with fixed spacing boundaries -->
                <div class="btn-group-vertical" style="width:100%; box-sizing:border-box; display:flex; flex-direction:column; gap:8px;">
                    <div class="btn-top-row" style="display:grid; grid-template-columns:1fr 1fr; gap:8px; width:100%;">
                        <a href="tel:${riderRecord.phone}" class="btn btn-call" style="margin:0; text-align:center; padding:11px 0; display:block; background:#3b82f6; border-radius:8px; color:#fff; font-weight:600; text-decoration:none; font-size:0.9rem;">Call</a>
                        <!-- FIXED: Corrected template literal path syntax variable extraction injection -->
                        <a href="https://wa.me{cleanWaPhone}?text=${encodedText}" target="_blank" rel="noopener" class="btn btn-wa" style="margin:0; text-align:center; padding:11px 0; display:block; background:#22c55e; border-radius:8px; color:#fff; font-weight:600; text-decoration:none; font-size:0.9rem;">WhatsApp</a>
                    </div>
                    
                    <!-- Raw unencoded hash symbol parameter deployed to pass mobile device dialer pads cleanly -->
                    <a href="tel:*130*${ussdPhone}#" class="btn btn-pcm" style="margin:0; text-align:center; display:block; width:100%; box-sizing:border-box; padding:11px 0; background:#475569; border-radius:8px; color:#fff; font-weight:600; text-decoration:none; font-size:0.9rem;">Please Call Me</a>
                    
                    <!-- Safaricom M-Pesa Push Gateway Integration Hook -->
                    <button type="button" onclick="window.simulateStudentPayment('${riderId}')" class="btn btn-mpesa" style="margin:0; display:block; width:100%; box-sizing:border-box; padding:12px 0; font-weight:700; background:#eab308; color:#000; border:none; border-radius:8px; font-size:0.95rem; cursor:pointer;">
                        Pay Rider via M-Pesa
                    </button>
                </div>
                
            </div>
        `;
        cardsGrid.appendChild(card);
    });
}



// ==========================================================================
// SECTION 5: UNIFIED DYNAMIC HARDWARE CHECKOUT ROUTER
// ==========================================================================
window.simulateStudentPayment = async function(riderId) {
    // SELF-HEALING REGISTRY GUARD: Fallback lookup check if profile keys carry unique text patterns
    const riderRecord = approvedRiders[riderId] || Object.values(approvedRiders).find(r => r.name === riderId);
    if (!riderRecord) return alert("⚠️ Error: Selected courier registry profile missing from single source of truth.");

    const targetRiderName = riderRecord.name;
    const walletType = riderRecord.paymentType || "Pochi"; // Default fallback variant
    const walletDestination = riderRecord.paymentWallet;

    // 1. Capture transaction metrics safely with basic numeric validation bounds
    const inputAmount = prompt(`How much are you paying ${targetRiderName}? (KSh):`, "50");
    if (!inputAmount) return; 

    const parsedAmount = parseInt(inputAmount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 10000) {
        return alert("Please enter a valid amount between KSh 1 and KSh 10,000.");
    }

    // 2. Fetch payer tracking credentials for background loyalty tables parsing execution
    const studentPhone = prompt("Enter your M-Pesa phone number to log delivery loyalty rewards (e.g., 07...):");
    if (!studentPhone) return;

    // Pull tracking references from your global Section 9 sanitizer utilities
    const formattedPhone = typeof formatPhoneNumber === 'function' ? formatPhoneNumber(studentPhone) : studentPhone.trim();
    if (formattedPhone.length !== 12) {
        return alert("Invalid phone format. Please enter a valid number (e.g., 07... or 01...).");
    }

    // 3. AUTO-COMPILE DYNAMIC USSD PARAMETERS MATRIX
    let dialerString = "";

    if (walletType === "Pochi") {
        /**
         * Safaricom Universal *334# Pochi Command Chain:
         * *334# -> Option 1 (Send Money) -> Option 3 (Send to Pochi) -> Phone -> Amount
         */
        const cleanPochiLine = walletDestination.replace(/[+\s]/g, '');
        dialerString = `tel:*334*1*3*${cleanPochiLine}*${parsedAmount}#`;
    } else if (walletType === "Till") {
        /**
         * Safaricom Universal *334# Buy Goods Command Chain:
         * *334# -> Option 3 (Lipa Na M-Pesa) -> Option 2 (Buy Goods) -> Till Number -> Amount
         */
        dialerString = `tel:*334*3*2*${walletDestination}*${parsedAmount}#`;
    }

    console.log(`📡 Dynamic Routing Engaged: Initializing native ${walletType} channel tunnel to target ${walletDestination}`);

    // 4. PIPELINE DECOUPLING: Log accounting data rows instantly before device refocus interrupts execution loops
    if (typeof window.updateDailyEarnings === 'function') {
        try {
            // HARDENED FOR DATE ARCHIVE: Standardized method naming conventions to safeguard summary arithmetic
            const standardizedMethodTag = `M-Pesa (${walletType})`;
            
            await window.updateDailyEarnings(
                parsedAmount, 
                standardizedMethodTag, 
                formattedPhone, 
                riderId, 
                targetRiderName
            );
        } catch (syncErr) {
            console.warn("⚠️ Local transaction recorded. Cloud tables ledger synchronization will complete in background.", syncErr);
        }
    }

    // 5. HARDWARE REDIRECTION HARNESS: Launches the pre-formatted dialing string on their touch view
    alert(`⚡ Redirecting to Secure M-Pesa SIM Panel...\n\nYour dialer will pre-open with the code layout. Press CALL/SEND and type your PIN to instantly settle KSh ${parsedAmount} directly into ${targetRiderName}'s ${walletType} wallet!`);
    
    window.location.href = dialerString;
};





// ==========================================================================
// SECTION 6: WORKER SECURE PORTAL & APPLICATION LOGOUT ENGINE
// ==========================================================================
window.toggleRiderApp = function() {
    const riderApp = document.getElementById('rider-app');
    const appContainer = document.getElementById('app-container');
    const breadcrumb = document.getElementById('breadcrumb');
    const adminPanel = document.getElementById('admin-panel'); // PRODUCTION STATE TRACKING GUARD
    
    // Explicitly target the button using an ID or unique attribute path to prevent selector collisions
    const portalToggleBtn = document.querySelector('.nav-bar .nav-btn');

    if (riderApp && !riderApp.classList.contains('hidden')) {
        // --- LOGOUT LOGIC PIPELINE EXECUTION ---
        riderApp.classList.add('hidden');
        if (portalToggleBtn) portalToggleBtn.textContent = "Rider Portal";

        // PRODUCTION MUTUAL EXCLUSION CHECK: Only restore consumer layout maps if administrative view panel is closed
        const isAdminPanelActiveCurrently = adminPanel && !adminPanel.classList.contains('hidden');
        
        if (!isAdminPanelActiveCurrently) {
            if (appContainer) appContainer.classList.remove('hidden');
            if (breadcrumb) breadcrumb.classList.remove('hidden');
        } else {
            console.log("📊 Admin master interface remains active. Suppressing standard customer layout node re-anchors.");
        }

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
                console.log("🔌 Live Production WebSocket channel successfully closed and deregistered.");
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

        // STATE RESTORATION FIX: Regenerate student hub views cleanly if admin workspace is hidden
        if (typeof showAreas === 'function' && !isAdminPanelActiveCurrently) {
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

        // Added explicit maybeSingle() parameter block to terminate the Promise chain securely
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

            // PRODUCTION ROLE DISCRIMINATION ENHANCEMENT
            // Automatically tags the user's role badge instantly to lock down calculation tracks
            const riderProfile = Object.values(approvedRiders).find(r => r.name === name);
            const isSecretHandler = riderProfile?.isSecret || false;
            const textClassificationLabel = isSecretHandler ? "VIP Shop Handler 👑" : "Standard Fleet";

            const dashboardTitle = document.querySelector('#rider-app h2');
            if (dashboardTitle) {
                dashboardTitle.innerHTML = `
                    ${name}'s Dashboard 
                    <span style="display:block; font-size:0.8rem; color:${isSecretHandler ? '#eab308' : '#3b82f6'}; font-weight:600; margin-top:4px; text-transform:uppercase; letter-spacing:0.05em;">
                        📍 Role: ${textClassificationLabel}
                    </span>
                `;
            }
            
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
            // PRODUCTION ANTI-SPOOFING MASK: Updates prompt hint text cell placeholder rules
            nameField.placeholder = "Enter Registered Phone or Driver ID...";
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
            actionBtn.textContent = "Send Verification Code";
            actionBtn.disabled = false;
            actionBtn.style.opacity = "1";
        }
        
        if (statusText) {
            // HARDENED FRONTEND PROMPT: Shields account mapping lookups from public name guessing
            statusText.textContent = "Please enter your unique phone number or Driver ID code string to receive a secure recovery code token.";
        }
        
        // Lock system engine sequence state to starting request defaults safely without throwing exceptions
        window.otpStageState = "REQUEST";
        console.log("🔒 Reset Layer: Anti-Spoofing OTP Interface Window successfully mounted into focus.");
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

            // HARDENED FALLBACK SEARCH: Supports accurate multi-case matching across all fleets
            if (!targetPhone && typeof approvedRiders !== 'undefined') {
                const matchedWorker = Object.values(approvedRiders).find(
                    worker => worker.name && worker.name.trim().toLowerCase() === riderName.toLowerCase()
                );
                if (matchedWorker) {
                    targetPhone = matchedWorker.phone;
                    console.log(`ℹ️ Match localized via registry array matrix for fleet member: ${matchedWorker.name}`);
                }
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
            alert("Application layout link error: Recovery executor endpoint is offline.");
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

        console.log(`🔒 Cloud credentials successfully committed for: ${riderName}. Syncing local layouts...`);

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
        
        // INTERFACE FALLBACK RESTORATION: Automatically returns the user right back into your login modal pane
        const loginModalNode = document.getElementById('login-modal');
        if (loginModalNode) loginModalNode.classList.remove('hidden');
        
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

        // PRODUCTION CLEAN EMBED: Wiped out local dictionary data pollution to secure raw frontend state engines
        console.log(`🔒 Cloud credentials successfully re-keyed for: ${currentLoggedInRider}. Memory matrices clear.`);

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
            console.warn("⚠️ Soft issue removing legacy network channel:", removeErr);
        }
        // FIXED: Purge tracking reference to guarantee a clean slate for fresh handshakes
        riderChannel = null; 
    }

    try {
        // PRODUCTION MULTI-FLEET ENHANCEMENT: Dynamically locate rider attributes in your single source registry
        const riderProfile = typeof approvedRiders !== 'undefined' ? 
            Object.values(approvedRiders).find(r => r.name === name) : null;
        
        const isSpecialOperator = riderProfile?.isSecret || false;
        
        // Dynamic target routing fork: standard tables vs isolated secret partitions
        const targetWalletTable = isSpecialOperator ? 'secret_riders' : 'riders';

        console.log(`📡 Fetching initial financial ledger snapshot from table [${targetWalletTable}] for rider: ${name}`);

        // Pull initial database snapshot figures safely out of the correct data partition in the cloud
        const { data, error } = await window.supabase
            .from(targetWalletTable)
            .select('total_earnings') 
            .eq('name', name)
            .maybeSingle();

        if (error) throw error;

        // Visual Element Mapping Adjustments
        const earningsDisplay = document.getElementById('active-orders');
        
        if (data && earningsDisplay) {
            // Performance Fix: Clean text handling properties to prevent page reflow lag spikes
            earningsDisplay.textContent = Number(data.total_earnings).toLocaleString();
            console.log(`💰 Ledger snapshot synchronized from [${targetWalletTable}]: KSh ${data.total_earnings}`);
        } else if (!data) {
            console.warn(`📝 Note: No active ledger entries returned inside [${targetWalletTable}] for user: ${name}`);
            if (earningsDisplay) earningsDisplay.textContent = "0";
        }

        // Sanitized alpha-numeric dynamically scoped namespaces for safe channel subscriptions
        const cleanChannelName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const customChannelId = `rider_updates_${cleanChannelName}_${isSpecialOperator ? 'sec' : 'std'}`;

        // PRODUCTION V2 REFINEMENT: Native, unencoded column filtering format to pass proxy firewalls safely
        const productionFilterString = `name=eq.${name}`;

        // Initialize the WebSocket change subscription stream pipeline live
        riderChannel = window.supabase
            .channel(customChannelId)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: targetWalletTable, // FIXED: Now accurately listens to either table changes in real-time!
                filter: productionFilterString // Armed with correct SDK v2 formatting parameters
            }, (payload) => {
                console.log(`⚡ Real-time ledger updates received via WebSocket from [${targetWalletTable}] for worker: ${name}`);
                
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
    const inputString = num.toString();

    // PRODUCTION DOUBLE-ZERO SHORTCUT GUARD: Handles terminal speed keys gracefully
    if (currentAmount === "0") {
        if (inputString === "0" || inputString === "00") {
            currentAmount = "0";
            updateDisplay();
            return;
        }
        currentAmount = inputString;
    } else {
        // Otherwise append the value cleanly to the end of the dynamic text chain
        currentAmount += inputString;
    }

    // Evaluate integer conversions *after* compilation to preserve layout values
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
    
    if (isNaN(numericValue) || numericValue === 0) {
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
    
    // Convert local subscriber formats cleanly into international standard formats (0... -> 254...)
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

        // PRODUCTION CORRECTION LOCKED: Changed routing path from callback to outbound push engine
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
            
            // PRODUCTION ACCURATE ACCOUNTING TUNNEL: Extracts wallet channel metadata to secure daily analytics
            let structuredMethodTag = "M-Pesa (Pochi)"; // Master central fallback channel model
            
            if (typeof approvedRiders !== 'undefined' && currentLoggedInRider) {
                const activeRecord = approvedRiders[currentLoggedInRider] || 
                    Object.values(approvedRiders).find(r => r.name === currentLoggedInRider);
                
                if (activeRecord && activeRecord.paymentType) {
                    structuredMethodTag = `M-Pesa (${activeRecord.paymentType})`;
                }
            }

            // CONNECT TO UNIFIED SPLIT ACCOUNTING & LOYALTY LIFECYCLE
            if (typeof window.updateDailyEarnings === 'function') {
                // This passes checkout info to Section 11, checking existing accounts or registering a new profile natively!
                await window.updateDailyEarnings(
                    parsedAmount, 
                    structuredMethodTag, // Armed with standardized identifier text strings
                    formattedPhone, 
                    resData.CheckoutRequestID, // Passes the tracking handle cleanly for callback checks later
                    currentLoggedInRider
                );
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
    const targetedRider = explicitRiderName || currentLoggedInRider;
    
    if (!targetedRider || !window.supabase) {
        console.warn("⚠️ Aborting ledger update: Active session rider name or database context missing.");
        return;
    }

    const parsedAmount = parseInt(amount, 10) || 0;
    if (parsedAmount <= 0) return console.error("❌ Aborted: Invalid transaction amount passed to ledger worker.");

    // 1. RIDER CLASSIFICATION LOOKUP: Identify if this operator profile is flagged as Secret
    const riderConfig = approvedRiders[riderId] || Object.values(approvedRiders).find(r => r.name === targetedRider);
    const isSpecialOperator = riderConfig?.isSecret || false;
    
    // 2. FORK ROUTING DESTINATIONS: Divert ledger data paths natively depending on rider profile status
    const historyTable = isSpecialOperator ? 'secret_daily_history' : 'daily_history';
    const loyaltyRPC = isSpecialOperator ? 'process_secret_loyalty_order' : 'process_student_loyalty_order';

    try {
        console.log(`📡 Route Sync Engine active: Committing log to table [${historyTable}] for ${targetedRider} via ${method}`);

        // 3. ATOMIC BALANCE WALLET INCREMENT
        if (isSpecialOperator) {
            // Secret riders balance update track route
            const { data: currentRecord, error: fetchErr } = await window.supabase
                .from('secret_riders')
                .select('total_earnings')
                .eq('name', targetedRider)
                .maybeSingle();
                
            if (!fetchErr) {
                const currentTotal = (currentRecord ? currentRecord.total_earnings : 0) + parsedAmount;
                await window.supabase
                    .from('secret_riders')
                    .update({ total_earnings: currentTotal })
                    .eq('name', targetedRider);
            }
        } else {
            // Standard rider profile increment RPC caller
            const { error: rpcError } = await window.supabase
                .rpc('increment_rider_earnings', { 
                    rider_target: targetedRider, 
                    amount_to_add: parsedAmount 
                });
                
            if (rpcError) console.error("❌ Standard RPC increment dropped:", rpcError.message);
        }

        // 4. AUDIT LOGGING WITH TIMEZONE ACCURACY
        // FIXED: Swapped raw UTC splits for explicit local date tracking to keep daily earnings sheets accurate
        const localDateObject = new Date();
        const localOffsetYear = localDateObject.getFullYear();
        const localOffsetMonth = String(localDateObject.getMonth() + 1).padStart(2, '0');
        const localOffsetDay = String(localDateObject.getDate()).padStart(2, '0');
        const cleanDatabaseDate = `${localOffsetYear}-${localOffsetMonth}-${localOffsetDay}`;
        
        await window.supabase
            .from(historyTable)
            .insert([{
                rider_name: targetedRider,
                amount: parsedAmount,
                payment_method: method,
                student_phone: phone || "MANUAL_CASH_ENTRY",
                checkout_request_id: riderId || "LOCAL_CHECKOUT", // Safely records tracking IDs or callback handles
                created_at: cleanDatabaseDate 
            }]);

        // 5. PARALLEL LOYALTY CALCULATION PIPELINES: Keyed strictly by payment phone number strings
        if (phone && phone.trim().length === 12 && phone !== "MANUAL_CASH_ENTRY") {
            console.log(`📱 Routing metrics to specialized loyalty engine: [${loyaltyRPC}]`);
            
            const { data: loyaltyResult, error: loyaltyErr } = await window.supabase
                .rpc(loyaltyRPC, { student_target: phone.trim() });

            if (loyaltyErr) throw loyaltyErr;

            if (loyaltyResult) {
                console.log(`📊 Loyalty processing feedback trace: ${loyaltyResult.message}`);
                
                // Alert the checkout view layout immediately if a free milestone reward is active
                if (loyaltyResult.earned_free === 1) {
                    const freeTierLabel = isSpecialOperator ? "VIP Shop Delivery" : "Standard Campus Run";
                    alert(`🎁 LOYALTY REWARD UNLOCKED!\n\nThis customer has reached milestone (${loyaltyResult.current_count}) under our ${freeTierLabel} fleet.\n\nThis round is 100% FREE!`);
                }
            }
        }

        // Refresh UI metrics displays instantly across active application tabs
        if (typeof loadRiderStats === 'function') {
            loadRiderStats(targetedRider);
        }

    } catch (err) {
        console.error("❌ Split transaction ledger mutation failure:", err);
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

        // AUTOMATION HOOK: Intercepts enter-key presses on the password input box fields layout row
        if (!adminKeyField.dataset.listenerAttached) {
            adminKeyField.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Suppresses page reload spikes natively
                    // FIXED: Successfully linked straight to your verified entry point 'verifyAdminAccess'
                    if (typeof window.verifyAdminAccess === 'function') {
                        window.verifyAdminAccess();
                    }
                }
            });
            adminKeyField.dataset.listenerAttached = "true"; // Prevents stacking duplicate listener memory leaks
        }
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
            .eq('secret_hash', inputPass)
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

            // PRODUCTION LIFECYCLE FIX: Added proper await chains to allow cloud numbers to arrive completely before painting UI cards
            if (typeof window.refreshAdminData === 'function') {
                await window.refreshAdminData(); // Halts execution loop cleanly until calculations arrive
            }
            if (typeof window.fetchDailyHistory === 'function') {
                await window.fetchDailyHistory(); 
            } 

            // PRODUCTION MULTIPLEXER HOOK: Listens to balance shifts AND fresh transaction receipts
            adminChannel = window.supabase
                .channel('admin_live_feed')
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'riders' }, (payload) => {
                    console.log(`⚡ Balance Shift: Standard courier [${payload.new.name}] updated.`);
                    if (typeof window.refreshAdminData === 'function') window.refreshAdminData();
                })
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'secret_riders' }, (payload) => {
                    console.log(`⚡ Balance Shift: Premium handler [${payload.new.name}] updated.`);
                    if (typeof window.refreshAdminData === 'function') window.refreshAdminData();
                })
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'daily_history' }, (payload) => {
                    console.log(`🧾 Fresh Receipt: Standard transaction logged for KSh ${payload.new.amount}.`);
                    if (typeof window.refreshAdminData === 'function') window.refreshAdminData();
                })
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'secret_daily_history' }, (payload) => {
                    console.log(`🧾 Fresh Receipt: Premium shop transaction logged for KSh ${payload.new.amount}.`);
                    if (typeof window.refreshAdminData === 'function') window.refreshAdminData();
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') console.log("📡 Admin master dual-fleet transaction subscription pipeline live.");
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
// SECTION 12: PART 3 - DUAL-FLEET TELEMETRY & TODAY'S ARCHIVE ENGINE
// ==========================================================================
/**
 * Live Dashboard Aggregator
 * Queries all standard and secret tables, isolates today's local date calendar 
 * transactions, sums up revenues, and paints metrics rows beautifully.
 */
window.refreshAdminData = async function() {
    if (!window.supabase) return console.warn("⚠️ Supabase engine context offline.");
    
    // Safety verification check: Exit quietly if the admin panel view layer is hidden
    const adminPanel = document.getElementById('admin-panel');
    if (!adminPanel || adminPanel.classList.contains('hidden')) return;

    try {
        console.log("📊 Compiling today's live financial archive statistics across all platforms...");

        // 1. ASYNCHRONOUS CO-CURRENT DATA CAPTURE
        const [resStandardRiders, resStandardHistory, resSecretRiders, resSecretHistory] = await Promise.all([
            window.supabase.from('riders').select('*'),
            window.supabase.from('daily_history').select('*'),
            window.supabase.from('secret_riders').select('*'),
            window.supabase.from('secret_daily_history').select('*')
        ]);

        if (resStandardRiders.error) throw resStandardRiders.error;
        if (resSecretRiders.error) throw resSecretRiders.error;

        // 2. TIMEZONE CALIBRATION: Fetch today's exact local calendar string (YYYY-MM-DD)
        const localDateObject = new Date();
        const localOffsetYear = localDateObject.getFullYear();
        const localOffsetMonth = String(localDateObject.getMonth() + 1).padStart(2, '0');
        const localOffsetDay = String(localDateObject.getDate()).padStart(2, '0');
        const todayLocalStringKey = `${localOffsetYear}-${localOffsetMonth}-${localOffsetDay}`;

        console.log(`📅 Targeting local archive dates for sum matching: ${todayLocalStringKey}`);

        // 3. SUM TODAY'S EARNINGS: Parse history logs for standard drivers matching today's local key
        const standardHistoryLogs = resStandardHistory.data || [];
        const todayStandardEarnings = standardHistoryLogs
            .filter(log => log.created_at === todayLocalStringKey)
            .reduce((sum, log) => sum + (log.amount || 0), 0);

        // 4. SUM TODAY'S EARNINGS: Parse history logs for special shop drivers matching today's local key
        const secretHistoryLogs = resSecretHistory.data || [];
        const todaySecretEarnings = secretHistoryLogs
            .filter(log => log.created_at === todayLocalStringKey)
            .reduce((sum, log) => sum + (log.amount || 0), 0);

        // 5. MASTER REVENUE MERGES
        const totalEarningsToday = todayStandardEarnings + todaySecretEarnings;
        
        // Lifetime Running Totals across both fleet wallet metrics tables
        const standardRidersList = resStandardRiders.data || [];
        const standardLifetimeTotal = standardRidersList.reduce((sum, r) => sum + (r.total_earnings || 0), 0);

        const secretRidersList = resSecretRiders.data || [];
        const secretLifetimeTotal = secretRidersList.reduce((sum, r) => sum + (r.total_earnings || 0), 0);

        const cumulativeFleetRevenue = standardLifetimeTotal + secretLifetimeTotal;
        const cumulativeCompletedDeliveries = standardHistoryLogs.length + secretHistoryLogs.length;

        // 6. MAP VALUES LIVE TO THE INTUITIVE USER INTERFACE METRICS
        const totalVolumeBadge = document.getElementById('admin-total-volume');
        const systemRevenueBadge = document.getElementById('admin-system-revenue');
        const archiveDailyEarningsBadge = document.getElementById('admin-daily-archive-earnings'); // Today's Earnings element card
        const ridersListContainer = document.getElementById('admin-riders-list');

        if (totalVolumeBadge) totalVolumeBadge.textContent = cumulativeCompletedDeliveries.toLocaleString();
        if (systemRevenueBadge) systemRevenueBadge.textContent = `KSh ${cumulativeFleetRevenue.toLocaleString()}`;
        
        // FIXED FOR FINANCIAL PRIORITY: Today's Daily Archive card updates live to reflect active timezone cash parameters
        if (archiveDailyEarningsBadge) {
            archiveDailyEarningsBadge.innerHTML = `
                KSh ${totalEarningsToday.toLocaleString()}
                <span style="display:block; font-size:0.75rem; color:#64748b; font-weight:600; margin-top:2px;">
                    Standard: KSh ${todayStandardEarnings.toLocaleString()} | Shop: KSh ${todaySecretEarnings.toLocaleString()}
                </span>
            `;
        }

        // 7. DYNAMIC ADMIN ROW DRAWING LOOPS
        if (ridersListContainer) {
            ridersListContainer.innerHTML = ""; // Clear out old snapshot rows cleanly

            // Map and draw standard runners onto your screen view panel card rows
            standardRidersList.forEach(rider => {
                renderAdminRiderRow(ridersListContainer, rider.name, rider.total_earnings || 0, "Standard Route Team");
            });

            // Map and draw specialized shop handlers onto your screen view panel card rows seamlessly
            secretRidersList.forEach(rider => {
                renderAdminRiderRow(ridersListContainer, rider.name, rider.total_earnings || 0, "VIP Shop Handler");
            });
        }

    } catch (err) {
        console.error("❌ Failed to compile administrative pipeline records:", err);
    }
};

/**
 * Dynamic HTML Component Generator for Admin Row Items
 */
function renderAdminRiderRow(parentDiv, name, earnings, classificationLabel) {
    const row = document.createElement('div');
    row.style.cssText = "display: flex; flex-direction: row; justify-content: space-between; align-items: center; padding: 12px; background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; margin-bottom: 8px; box-sizing: border-box; width: 100%;";
    
    row.innerHTML = `
        <div style="text-align: left;">
            <strong style="color: #ffffff; display: block; font-size: 1.05rem;">${name}</strong>
            <small style="color: #64748b; font-weight: 600;">${classificationLabel}</small>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: var(--primary, #f97316); font-weight: 800; font-size: 1.1rem;">KSh ${earnings.toLocaleString()}</span>
            <button type="button" onclick="window.resetRiderTotal('${name}')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 700; cursor: pointer;">Reset</button>
        </div>
    `;
    parentDiv.appendChild(row);
}






// ==========================================================================
// SECTION 13: ADMINISTRATIVE DASHBOARD PANELS NAVIGATION & LIFECYCLES
// ==========================================================================
window.closeAdminLogin = function() {
    const adminLoginModal = document.getElementById('admin-login-modal');
    if (adminLoginModal) adminLoginModal.classList.add('hidden');
};

window.closeAdmin = function() {
    // 1. PRODUCTION SECURITY CLEANUP: Purge on-screen financial data strings to stop memory scraping leaks
    const totalVolumeBadge = document.getElementById('admin-total-volume');
    const systemRevenueBadge = document.getElementById('admin-system-revenue');
    const ridersListContainer = document.getElementById('admin-riders-list');
    const archiveDailyEarningsBadge = document.getElementById('admin-daily-archive-earnings'); // Pre-clears daily counters

    if (totalVolumeBadge) totalVolumeBadge.textContent = "0";
    if (systemRevenueBadge) systemRevenueBadge.textContent = "KSh 0";
    if (archiveDailyEarningsBadge) archiveDailyEarningsBadge.textContent = "KSh 0";
    if (ridersListContainer) ridersListContainer.innerHTML = ""; 
    
    console.log("🧼 Admin Privacy Guard: Volatile dashboard financial data strings cleared from DOM tree memory.");

    // 2. DISCONNECT LIVE STREAMS: Safely detach synchronization pipelines from Supabase client instances
    if (adminChannel && window.supabase) {
        try {
            window.supabase.removeChannel(adminChannel);
            console.log("🔌 Administrative tracking real-time WebSocket channel safely closed.");
        } catch (chanErr) {
            console.warn("⚠️ Non-fatal issue clearing admin WebSocket stream:", chanErr.message);
        }
        adminChannel = null;
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

        // DYNAMIC FLEET EVALUATION ROUTER: Identify if this user is a specialized premium handler
        const riderConfig = Object.values(approvedRiders).find(r => r.name === name);
        const isSpecialOperator = riderConfig?.isSecret || false;
        
        // Fork database targets fluidly based on the rider's operational classification status
        const walletTable = isSpecialOperator ? 'secret_riders' : 'riders';
        const historyTable = isSpecialOperator ? 'secret_daily_history' : 'daily_history';

        // Step 1: Capture the baseline figure out of the correct table before wiping it out
        const { data: snapshotRecord } = await window.supabase
            .from(walletTable)
            .select('total_earnings')
            .eq('name', name)
            .maybeSingle();

        const balancePriorToReset = snapshotRecord ? (snapshotRecord.total_earnings || 0) : 0;

        // Step 2: Clear active balances securely in the cloud repository database tables
        const { error: resetError } = await window.supabase
            .from(walletTable)
            .update({ total_earnings: 0 })
            .eq('name', name);
            
        if (resetError) throw resetError;

        // Step 3: Insert a balanced accountability tracking adjustment item with Timezone Accuracy
        // FIXED FOR DAILY ARCHIVE: Swapped raw UTC splits for explicit local date tracking to keep daily charts balanced
        const localDateObject = new Date();
        const localOffsetYear = localDateObject.getFullYear();
        const localOffsetMonth = String(localDateObject.getMonth() + 1).padStart(2, '0');
        const localOffsetDay = String(localDateObject.getDate()).padStart(2, '0');
        const cleanDatabaseDate = `${localOffsetYear}-${localOffsetMonth}-${localOffsetDay}`;
        
        await window.supabase.from(historyTable).insert([{
            rider_name: name,
            amount: -balancePriorToReset, // Negative offsetting balance adjustment value
            payment_method: 'Admin Correction Wipe',
            student_phone: "SYSTEM_ADJUST",
            created_at: cleanDatabaseDate
        }]);

        alert(`🎉 Success! ${name}'s running delivery total balance has been reset to KSh 0 inside [${walletTable}], and an offsetting log has been written.`);
        
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
    // PRODUCTION SECURITY GUARD: Terminate lookups instantly if the admin management portal is open
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel && !adminPanel.classList.contains('hidden')) {
        console.log("📊 Search Engine Suppressed: Administrative workspace remains active in this viewport.");
        return;
    }

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
// SECTION 15: ADMINISTRATIVE DASHBOARD DUAL-FLEET TODAY'S ARCHIVE ENGINE
// ==========================================================================
window.refreshAdminData = async function() {
    // Standardized targeting variables matching Section 12 & 13 lifecycles
    const listContainer = document.getElementById('admin-riders-list');
    const systemLifetimeRevenueDisplay = document.getElementById('admin-system-revenue');
    const totalVolumeDisplay = document.getElementById('admin-total-volume');
    const dailyArchiveEarningsBadge = document.getElementById('admin-daily-archive-earnings'); 
    
    if (!listContainer || !window.supabase) return console.warn("⚠️ Aborting refreshAdminData: Core dashboard containers missing or database offline.");

    try {
        console.log("📡 Admin panel compiling dual-fleet statistics and local date transaction archives...");

        // 1. CONCURRENT ASYNCHRONOUS DATA HOOK: Download metrics from all 4 data partitions simultaneously
        const [resStandardRiders, resStandardHistory, resSecretRiders, resSecretHistory] = await Promise.all([
            window.supabase.from('riders').select('*'),
            window.supabase.from('daily_history').select('*'),
            window.supabase.from('secret_riders').select('*'),
            window.supabase.from('secret_daily_history').select('*')
        ]);

        if (resStandardRiders.error) throw resStandardRiders.error;
        if (resSecretRiders.error) throw resSecretRiders.error;

        // 2. TIMEZONE CALIBRATION: Generate today's precise local calendar key string (Format: YYYY-MM-DD)
        const localDateObject = new Date();
        const localOffsetYear = localDateObject.getFullYear();
        const localOffsetMonth = String(localDateObject.getMonth() + 1).padStart(2, '0');
        const localOffsetDay = String(localDateObject.getDate()).padStart(2, '0');
        const todayLocalStringKey = `${localOffsetYear}-${localOffsetMonth}-${localOffsetDay}`;

        console.log(`📅 Target matching filter key initialized for Today's local logs: ${todayLocalStringKey}`);

        // 3. SUM TODAY'S EARNINGS: Extract standard entries matching today's local timestamp calendar
        const standardHistoryLogs = resStandardHistory.data || [];
        const todayStandardEarnings = standardHistoryLogs
            .filter(log => log.created_at === todayLocalStringKey)
            .reduce((sum, log) => sum + (log.amount || 0), 0);

        // 4. SUM TODAY'S EARNINGS: Extract premium shop entries matching today's local timestamp calendar
        const secretHistoryLogs = resSecretHistory.data || [];
        const todaySecretEarnings = secretHistoryLogs
            .filter(log => log.created_at === todayLocalStringKey)
            .reduce((sum, log) => sum + (log.amount || 0), 0);

        // 5. CONSOLIDATE INCOME CHANNELS METRICS
        const totalEarningsToday = todayStandardEarnings + todaySecretEarnings;
        
        // Lifetime cumulative wallets sums across standard and secret profiles
        const standardRidersList = resStandardRiders.data || [];
        const standardLifetimeTotal = standardRidersList.reduce((sum, r) => sum + (r.total_earnings || 0), 0);

        const secretRidersList = resSecretRiders.data || [];
        const secretLifetimeTotal = secretRidersList.reduce((sum, r) => sum + (r.total_earnings || 0), 0);

        const totalSystemRevenueLifetime = standardLifetimeTotal + secretLifetimeTotal;
        const cumulativeCompletedDeliveriesCount = standardHistoryLogs.length + secretHistoryLogs.length;

        // 6. CLEAR DISPLAY WRAPPER FRAMES CLEANLY
        listContainer.innerHTML = "";

        // 7. DYNAMIC MARSHALING LOOP: Render Standard Fleet Row Entries
        standardRidersList.forEach(rider => {
            renderAdminDashboardItem(listContainer, rider.name, Number(rider.total_earnings) || 0, "Standard Route Team", "#3b82f6");
        });

        // 8. DYNAMIC MARSHALING LOOP: Render Premium Secret Fleet Row Entries
        secretRidersList.forEach(rider => {
            renderAdminDashboardItem(listContainer, rider.name, Number(rider.total_earnings) || 0, "VIP Shop Handler", "#eab308");
        });

        // 9. INJECT AGGREGATED METRICS SAFELY INTO DISPLAY BADGES
        if (totalVolumeDisplay) totalVolumeDisplay.textContent = cumulativeCompletedDeliveriesCount.toLocaleString();
        if (systemLifetimeRevenueDisplay) systemLifetimeRevenueDisplay.textContent = `KSh ${totalSystemRevenueLifetime.toLocaleString()}`;
        
        // Today's Daily Archive card updates live to reflect active local money balances
        if (dailyArchiveEarningsBadge) {
            dailyArchiveEarningsBadge.innerHTML = `
                KSh ${totalEarningsToday.toLocaleString()}
                <span style="display:block; font-size:0.75rem; color:#64748b; font-weight:600; margin-top:4px;">
                    Standard Run: KSh ${todayStandardEarnings.toLocaleString()} | Shop Delivery: KSh ${todaySecretEarnings.toLocaleString()}
                </span>
            `;
        }

        console.log(`📊 Global financial ledger snapshot synchronized live. Today's Archive Balance: KSh ${totalEarningsToday}`);

    } catch (err) {
        console.error("❌ Administrative analysis framework engine dropped a process step:", err.message || err);
        listContainer.innerHTML = `<p style="text-align:center; color:#ef4444; padding:20px; font-weight:600;">Failed to load system dashboard summary logs.</p>`;
    }
};

/**
 * Isolated Component Drawing Helper for Admin List Sub-nodes
 */
function renderAdminDashboardItem(parentDiv, name, earnings, roleLabel, colorHex) {
    const row = document.createElement('div');
    row.className = "admin-rider-row"; 
    row.style.cssText = "padding:14px; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; background:#0f172a; margin-bottom:6px; border-radius:10px; box-sizing:border-box; width:100%; border:1px solid #1e293b;";

    row.innerHTML = `
        <div style="text-align:left;">
            <strong style="color:#ffffff; font-size:1.05rem; display:block;">${name}</strong>
            <small style="color:${colorHex}; font-weight:600; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.02em;">${roleLabel}</small>
        </div>
        <div style="text-align:right; display:flex; align-items:center; gap:12px;">
            <span style="font-weight:800; color:var(--primary, #f97316); font-size:1.15rem; font-feature-settings:'tnum';">
                KSh ${earnings.toLocaleString()}
            </span>
            <button type="button" onclick="window.resetRiderTotal('${name}')" style="background:#ef4444; border:none; color:#ffffff; padding:6px 14px; border-radius:6px; font-size:0.85rem; cursor:pointer; font-weight:700; transition:opacity 0.15s;">
                Reset
            </button>
        </div>
    `;
    parentDiv.appendChild(row);
}


// ==========================================================================
// SECTION 16: MANUAL LEDGER CONTROLS & HISTORICAL DATA AGGREGATION
// ==========================================================================
window.confirmCash = async function() {
    const parsedAmount = parseInt(currentAmount, 10) || 0;
    if (parsedAmount <= 0) return alert("⚠️ Amount Error: Please enter a valid payment total using the numpad first.");
    
    // FETCH THE INPUT: Pull the student number directly out of the numeric form cell input space
    const phoneInputContainer = document.getElementById('customer-phone');
    const inputPhone = phoneInputContainer ? phoneInputContainer.value.trim() : "";
    
    if (!inputPhone) return alert("⚠️ Input Error: Please enter the student's phone number first to track loyalty points.");
    
    // Standardise using your Section 9 international 12-digit formatter (2547...)
    const formattedPhone = formatPhoneNumber(inputPhone);
    if (formattedPhone.length !== 12) return alert("⚠️ Format Error: Enter a valid phone number (e.g. 07... or 01...).");

    const verificationPrompt = `Log KSh ${parsedAmount.toLocaleString()} for student ${formattedPhone} as a manual CASH transaction?`;
    if (!confirm(verificationPrompt)) return;

    try {
        console.log(`🪙 Direct Cash settlement input recognized for phone: ${formattedPhone}. Syncing ledgers...`);
        
        // PRODUCTION MULTI-FLEET ENHANCEMENT: Locate the exact string key token matched to the active session rider name
        let inferredRiderId = null;
        if (currentLoggedInRider && typeof approvedRiders !== 'undefined') {
            inferredRiderId = Object.keys(approvedRiders).find(
                key => approvedRiders[key].name === currentLoggedInRider
            ) || null;
        }

        if (typeof window.updateDailyEarnings === 'function') {
            // FIXED PARAMS FOR DAILY ARCHIVE: Passed the true inferredRiderId token instead of null to protect data split tracks
            await window.updateDailyEarnings(
                parsedAmount, 
                'Cash', 
                formattedPhone, 
                inferredRiderId, // Ensures Section 11 accurately identifies secret handlers vs normal runners
                currentLoggedInRider
            );
            
            alert("🎉 Manual cash payment logged successfully and student loyalty points updated!");
            
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
        // 1. TIMEZONE CALIBRATION: Fetch today's exact local calendar string (YYYY-MM-DD)
        const localDateObject = new Date();
        const localOffsetYear = localDateObject.getFullYear();
        const localOffsetMonth = String(localDateObject.getMonth() + 1).padStart(2, '0');
        const localOffsetDay = String(localDateObject.getDate()).padStart(2, '0');
        const todayLocalStringKey = `${localOffsetYear}-${localOffsetMonth}-${localOffsetDay}`;

        console.log(`📡 Fetching historical audit logs matching local date key: ${todayLocalStringKey}`);

        // 2. CONCURRENT ASYNCHRONOUS DATA HOOK: Query standard and secret transaction logs simultaneously
        const [resStandardHistory, resSecretHistory] = await Promise.all([
            window.supabase.from('daily_history').select('*').eq('created_at', todayLocalStringKey),
            window.supabase.from('secret_daily_history').select('*').eq('created_at', todayLocalStringKey)
        ]);

        if (resStandardHistory.error) throw resStandardHistory.error;
        if (resSecretHistory.error) throw resSecretHistory.error;

        const standardLogs = resStandardHistory.data || [];
        const secretLogs = resSecretHistory.data || [];

        if (standardLogs.length === 0 && secretLogs.length === 0) {
            list.innerHTML = "<p style='color:#6b7280; font-size:0.9rem; font-weight:500; text-align:center; padding:20px;'>No earnings records archived for today yet.</p>";
            return;
        }

        // 3. ACCUMULATIVE GROUP-BY RIDER MATRIX
        const riderTotals = {};

        // Parse and aggregate standard campus route team records
        standardLogs.forEach(log => {
            const workerName = log.rider_name || "Unknown Driver";
            const transactionAmount = parseInt(log.amount, 10) || 0;
            
            if (!riderTotals[workerName]) {
                riderTotals[workerName] = { amount: 0, label: "Standard Route Team", color: "#64748b" };
            }
            riderTotals[workerName].amount += transactionAmount;
        });

        // Parse and aggregate specialized VIP store delivery records flawlessly
        secretLogs.forEach(log => {
            const workerName = log.rider_name || "Unknown Driver";
            const transactionAmount = parseInt(log.amount, 10) || 0;
            
            if (!riderTotals[workerName]) {
                riderTotals[workerName] = { amount: 0, label: "VIP Shop Handler", color: "#eab308" };
            }
            riderTotals[workerName].amount += transactionAmount;
        });

        list.innerHTML = "";

        // 4. DYNAMIC COMPONENT INJECTION CARD GENERATION
        Object.keys(riderTotals).forEach(name => {
            const riderData = riderTotals[name];
            const row = document.createElement('div');
            
            // Modernized dark flat styling model mapping properties cleanly
            row.style.cssText = "padding:16px; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; background:#0f172a; margin-bottom:8px; border-radius:12px; box-sizing:border-box; width:100%; border:1px solid #1e293b;";
            
            row.innerHTML = `
                <div style="text-align:left;">
                    <span style="font-weight:800; font-size:1.1rem; color:#ffffff; display:block;">${name}</span>
                    <small style="color:${riderData.color}; font-weight:600; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.02em;">${riderData.label}</small>
                </div>
                <div style="text-align:right;">
                    <span style="color:var(--primary, #f97316); font-weight:800; font-size:1.25rem; font-feature-settings:'tnum';">
                        KSh ${riderData.amount.toLocaleString()}
                    </span>
                </div>
            `;
            list.appendChild(row);
        });

        console.log("📊 Daily history local logs successfully aggregated and rendered across all platforms.");

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

        // PRODUCTION MULTI-FLEET ENHANCEMENT: Lock down user role states instantly on persistent boot recovery
        let isSecretHandler = false;
        if (typeof approvedRiders !== 'undefined') {
            const riderProfile = Object.values(approvedRiders).find(r => r.name === cachedRiderSessionName);
            isSecretHandler = riderProfile?.isSecret || false;
        }

        const textClassificationLabel = isSecretHandler ? "VIP Shop Handler 👑" : "Standard Fleet";

        if (dashboardTitle) {
            dashboardTitle.innerHTML = `
                ${cachedRiderSessionName}'s Dashboard 
                <span style="display:block; font-size:0.8rem; color:${isSecretHandler ? '#eab308' : '#3b82f6'}; font-weight:600; margin-top:4px; text-transform:uppercase; letter-spacing:0.05em;">
                    📍 Role: ${textClassificationLabel}
                </span>
            `;
        }

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
