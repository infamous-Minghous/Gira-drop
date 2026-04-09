// script.js (Clean Version)
let riderChannel = null; // Keep this at the very top
let currentLoggedInRider = null;
let typedAmount = "0";

// --- INITIALIZATION CHECK ---
// This ensures that as soon as the window.supabase is ready, 
// if a rider was already logged in, we fetch their data.
window.addEventListener('load', () => {
    if (window.supabase && currentLoggedInRider) {
        loadRiderStats(currentLoggedInRider);
    }
});
// --- ADMIN & SECURITY CONFIG ---
const ADMIN_PASS = "maseno_admin_2024";

// One single declaration for approved riders
const approvedRiders = {
    "Bravin": { id: "RD001", key: "7890" },
    "Mercy": { id: "RD002", key: "1234" },
    "John": { id: "RD003", key: "5566" }
};

// --- DATA STRUCTURE ---
const data = {
    "Siriba": {
        image: "images/siriba.jpg",
        buildings: [
            { 
                name: "Complex", 
                img: "images/card2-image8.jpg",
                riders: [
                    { name: "Bravin", phone: "+2547000000", status: "At Complex Gate", avatar: "images/bravin.jpg" }
                ]
            },
            { 
                name: "Hollywood", 
                img: "images/card3-image7.jpg",
                riders: [
                    { name: "Mercy", phone: "+2547000001", status: "Waiting at Hollywood", avatar: "images/bravin.jpg"}
                ]
            },
            { 
                name: "Sunrise", 
                img: "images/card2-image2.jpg",
                riders: [
                    { name: "Mercy", phone: "+2547000001", status: "Waiting at Hollywood", avatar: "images/bravin.jpg" }
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
                    { name: "John", phone: "+2547000002", waPhone:"+254700000000", status: "Outside Tsunami", avatar: "images/bravin.jpg" }
                ]
            },
            { 
                name: "Science Park", 
                img: "images/card3-image6.jpg",
                riders: [] //Empty so LOCKED
            }
        ]
    }
};

const container = document.getElementById('app-container');
const breadcrumb = document.getElementById('breadcrumb');

// --- CUSTOMER VIEW FUNCTIONS ---

function showAreas() {
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
    breadcrumb.innerHTML = `🠐 Back to Areas`;
    breadcrumb.onclick = showAreas;
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "1fr 1fr"; 

    data[areaName].buildings.forEach(buildingObj => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.backgroundImage = `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0)), url('${buildingObj.img}')`;
        card.innerHTML = `<h3>${buildingObj.name}</h3>`;
        card.onclick = () => showRiders(areaName, buildingObj.name);
        const isLocked = !buildingObj.riders || buildingObj.riders.length === 0;
        // If locked, add 'locked' class and remove onclick
        card.className = `card ${isLocked ? 'locked' : ''}`;
       
        if (isLocked) {
            card.innerHTML = `
                <div class="lock-icon">🔒</div>
                <h3>${buildingObj.name}</h3>
                <small style="color:#ffbc8c; z-index:2;">No Riders Available</small>
            `;
            card.onclick = () => alert(`${buildingObj.name} is currently closed. No riders available!`);
        }else {
            card.innerHTML = `<h3>${buildingObj.name}</h3>`;
            card.onclick = () => showRiders(areaName, buildingObj.name);
        }
        container.appendChild(card);
    });
}

function showRiders(area, buildingName) {
    const buildingObj = data[area].buildings.find(b => b.name === buildingName);
    breadcrumb.innerHTML = `🠐 Back to ${buildingName}`;
    breadcrumb.onclick = () => showBuildings(area);
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "1fr";

    if (!buildingObj.riders || buildingObj.riders.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:40px; color:gray;">No riders currently at ${buildingName}</p>`;
        return;
    }
    
    buildingObj.riders.forEach(rider => {
        const card = document.createElement('div');
        card.className = 'card rider-card';
        card.style.height = "auto";
        card.style.padding = "20px";

        // 1. WhatsApp Logic: Use waPhone if it exists, otherwise use call phone
        const whatsAppTarget = rider.waPhone || rider.phone;
        const cleanWaPhone = whatsAppTarget.replace('+', '').replace(/\s+/g, '');

        // 2. USSD Logic: Format +254... to 0... for "Please Call Me"
        const ussdPhone = rider.phone.replace('+254', '0').replace(/\s+/g, '');

        card.innerHTML = `
            <div style="z-index:2; display:flex; align-items:center; gap:15px; flex:1;">
                <div style="width: 55px; height: 55px; background: #f97316; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; color: white; border: 2px solid white; flex-shrink: 0;">
                    ${rider.name.charAt(0).toUpperCase()}
                </div>
                <div style="text-align: left;">
                    <h3 style="margin:0; color:white;">${rider.name}</h3>
                    <small style="color:#ddd;">${rider.status}</small>
                </div>
            </div>
            <div class="btn-group-vertical" style="z-index:2;">
                <div class="btn-top-row" style="display:flex; gap:8px; margin-bottom:8px;">
                    <a href="tel:${rider.phone}" class="btn btn-call" style="flex:1; text-align:center;">Call</a>
                    <!-- FIXED: Changed waPhone to cleanWaPhone below -->
                    <a href="https://wa.me/${cleanWaPhone}?text=Hi ${rider.name}, I am at ${buildingName}." target="_blank" class="btn btn-wa" style="flex:1; text-align:center;">WhatsApp</a>
                </div>
                
                <a href="tel:*130*${ussdPhone}%23" class="btn btn-pcm" style="font-size: 0.85rem; padding: 12px 5px; display:block; text-align:center; margin-bottom:8px;">Please Call Me</a>
                
                <button onclick="simulateStudentPayment('${rider.name}')" class="btn btn-mpesa" style="font-size: 0.85rem; padding: 12px 5px; display:block; text-align:center; background:#22c55e; border:none; width:100%; color:white; font-weight:bold; border-radius:8px; cursor:pointer;">Pay Rider via M-Pesa</button>
            </div>
        `;
        container.appendChild(card);
    });
}


// Logic for the Student to choose an amount and "Pay" the Rider
async function simulateStudentPayment(riderName) {
    // 1. Ask for the amount first
    const amount = prompt(`How much are you paying ${riderName}?`, "50");
    const payBtn = document.querySelector('.btn-mpesa');
    const originalText = payBtn.innerText;

    payBtn.innerText = "Processing..."; // Tactile feedback
    payBtn.disabled = true; 
    payBtn.style.opacity = "0.5";
    
    // Validate the amount
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
        return alert("Please enter a valid amount.");
    }

    // 2. Ask for the phone number
    const studentPhone = prompt("Enter your M-Pesa Number (e.g. 0712...):");
    if (!studentPhone || studentPhone.length < 10) {
        return alert("Please enter a valid phone number.");
    }

    // 3. Start the UI simulation
    document.getElementById('loading-overlay').classList.remove('hidden');
    document.querySelector('.loading-text').innerText = `Requesting PIN for KSh ${amount}...`;

    // 4. Simulate the network delay
    setTimeout(async () => {
        document.getElementById('loading-overlay').classList.add('hidden');
        alert(`Payment of KSh ${amount} to ${riderName} was successful!`);
        
        // 5. Sync to Cloud
        // We temporarily set currentLoggedInRider to ensure the money goes to the right person
        const originalRider = currentLoggedInRider;
        currentLoggedInRider = riderName; 
        
        await updateDailyEarnings(parseInt(amount));
        payBtn.innerText = originalText;
        payBtn.disabled = false;
        payBtn.style.opacity = "1";
        
        // Restore previous session state
        currentLoggedInRider = originalRider; 
        
    }, 4000);
}

// --- PORTAL LOGIC ---

function toggleRiderApp() {
    const riderApp = document.getElementById('rider-app');
    
    if (!riderApp.classList.contains('hidden')) {
        // --- LOGOUT LOGIC ---
        riderApp.classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('breadcrumb').classList.remove('hidden');
        document.querySelector('.nav-btn').innerText = "Rider Portal";

        // FIXED: Using the correct IDs from your HTML
        const nameField = document.getElementById('rider-portal-id');
        const keyField = document.getElementById('rider-portal-key');
        
        if(nameField) nameField.value = ""; 
        if(keyField) {
            keyField.value = "";
            keyField.type = "text"; 
        }
        
        currentLoggedInRider = null;
        return;
    }

    // --- LOGIN LOGIC ---
    document.getElementById('login-modal').classList.remove('hidden');
}

// 3. Authenticate Rider (Login)
function authenticateRider() {
    const nameInput = document.getElementById('rider-portal-id');
    const keyInput = document.getElementById('rider-portal-key');
    const name = nameInput.value.trim();
    const key = keyInput.value;

    if (approvedRiders[name] && approvedRiders[name].key === key) {
        currentLoggedInRider = name;
        
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('rider-app').classList.remove('hidden');
        document.getElementById('breadcrumb').classList.add('hidden');
        document.querySelector('.nav-btn').innerText = "Log Out";

        document.querySelector('#rider-app h2').innerText = `${name}'s Dashboard`;
        
        // Trigger Cloud Load
        loadRiderStats(name);
        
        nameInput.value = "";
        keyInput.value = "";
    } else {
        alert("Unauthorized! Check credentials.");
    }
}

// 1. Load Initial Stats & Listen for REAL-TIME changes
async function loadRiderStats(name) {
    if (!window.supabase) {
        console.warn("Waiting for Supabase connection...");
        return;
    }

    if (riderChannel) {
        window.supabase.removeChannel(riderChannel);
    }


    // 1. Get the starting total from the correct column
    const { data, error } = await window.supabase
        .from('riders')
        .select('total_earnings') 
        .eq('name', name)
        .single();

    if (data) {
        document.getElementById('active-orders').innerText = data.total_earnings.toLocaleString();
    }

    // 2. Create New Real-time Channel
    riderChannel = window.supabase
        .channel('rider-updates')
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'riders', 
            filter: `name=eq.${name}` 
        }, (payload) => {
            console.log("⚡ Live Update:", payload.new.total_earnings);
            document.getElementById('active-orders').innerText = payload.new.total_earnings.toLocaleString();
        })
        .subscribe();
}

// --- PAYMENT LOGIC ---

function openRiderView() {
    document.getElementById('rider-view').classList.remove('hidden');
    clearNum();
}

function closeRiderView() {
    document.getElementById('rider-view').classList.add('hidden');
}

function appendNum(num) {
    if (typedAmount === "0") typedAmount = num.toString();
    else typedAmount += num.toString();

    if (parseInt(typedAmount) > 5000) {
        alert("Limit KSh 5,000");
        clearNum();
        return;
    }
    updateDisplay();
}

function clearNum() {
    typedAmount = "0";
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('display-amount').innerText = parseInt(typedAmount).toLocaleString();
}

function formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
    return cleaned;
}

function initiateSTK() {
     const phoneInput = document.getElementById('customer-phone').value;
    const formattedPhone = formatPhoneNumber(phoneInput);
    
    if (formattedPhone.length !== 12) {
        return alert("Enter a valid 10-digit number.");
    }
    
    if (typedAmount === "0") return alert("Enter amount.");

    // 1. Show the Spinner
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.querySelector('.loading-text');
    
    overlay.classList.remove('hidden');
    loadingText.innerHTML = `Requesting KSh ${typedAmount} <br> <small style="color:#ccc">Sending to ${formattedPhone}...</small>`;
// 2. Simulate the Wait (Real STK Push time)
    setTimeout(async () => {
        // 3. Log the payment to Supabase
        await updateDailyEarnings(typedAmount, 'M-Pesa', formattedPhone);
        
        // 4. Hide overlay and close rider view
        overlay.classList.add('hidden');
        closeRiderView();
        
        // Final success feedback
        alert("STK Push Sent! Check your phone.");
    }, 3500); 

    

   
}

// 2. Update Earnings (Payment Logic)
async function updateDailyEarnings(amount, method = 'M-Pesa', phone = null) {
    if (!currentLoggedInRider || !window.supabase) return;

    // 1. Fetch current total
    const { data, error: fetchError } = await window.supabase
        .from('riders')
        .select('total_earnings')
        .eq('name', currentLoggedInRider)
        .single();

    if (fetchError) {
        console.error("❌ Rider not found in DB:", fetchError.message);
        return;
    }

    const newTotal = (data.total_earnings || 0) + parseInt(amount);

    // 2. Update the Rider's total_earnings
    const { error: updateError } = await window.supabase
        .from('riders')
        .update({ total_earnings: newTotal })
        .eq('name', currentLoggedInRider);

    if (updateError) {
        console.error("❌ Supabase Update Failed:", updateError.message);
        return; // Stop here if the main update fails
    }

    // 3. Log the transaction to history
    const { error: historyError } = await window.supabase
        .from('daily_history')
        .insert([{
            rider_name: currentLoggedInRider,
            amount: parseInt(amount),
            payment_method: method,
            student_phone: phone,
            created_at: new Date().toISOString().split('T')[0] 
        }]);

    if (historyError) {
        console.error("⚠️ History log failed:", historyError.message);
    } else {
        console.log(`✅ Success! ${currentLoggedInRider} total updated to KSh ${newTotal}`);
        loadRiderStats(currentLoggedInRider);
    }
}


function hideLogin() {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.classList.add('hidden');
    }
}


// 1. Trigger the Modal from the footer
function openAdminPortal() {
    document.getElementById('admin-login-modal').classList.remove('hidden');
    document.getElementById('admin-master-key').value = ""; // Clear for security
    document.getElementById('admin-master-key').focus();
}

// 2. Verify the Password
function verifyAdminAccess() {
    const pass = document.getElementById('admin-master-key').value;
    
    if (pass === ADMIN_PASS) {
        // Hide Login and Student/Rider views
        document.getElementById('admin-login-modal').classList.add('hidden');
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('rider-app').classList.add('hidden');
        document.getElementById('breadcrumb').classList.add('hidden');

        // Show Admin Panel
        document.getElementById('admin-panel').classList.remove('hidden');
        refreshAdminData();
            window.supabase.channel('admin-feed').on('postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'riders' }, 
            () => refreshAdminData()
            ).subscribe();
        } else {
        alert("Invalid Master Password!");
        document.getElementById('admin-master-key').value = "";
    }
}

// 3. Close the Login Modal
function closeAdminLogin() {
    document.getElementById('admin-login-modal').classList.add('hidden');
}

function closeAdmin() {

    window.supabase.removeChannel(window.supabase.channel('admin-feed'));

    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    // 1. Hide the Admin Panel
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.classList.add('hidden');

    // 2. Show the Student View (Main App)
    const studentView = document.getElementById('app-container');
    if (studentView) studentView.classList.remove('hidden');
    // 3. Show the Breadcrumb
    const breadcrumb = document.getElementById('breadcrumb');
    if (breadcrumb) {
        breadcrumb.classList.remove('hidden');
        breadcrumb.style.visibility = "visible"; // Extra check for visibility
    }
    // 4. Reset the Navigation Button text
    const navBtn = document.querySelector('.nav-btn');
    if (navBtn) navBtn.innerText = "Rider Portal";

    // 5. Reset to the main "Areas" view
    showAreas();
}


//For the Refreshment of Riders ativity ini admin portal
function verifyAdminAccess() {
    const password = document.getElementById('admin-master-key').value;
    
    if (password === ADMIN_PASS) {
        document.getElementById('admin-login-modal').classList.add('hidden');
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');

        // Go straight to the history records
        fetchDailyHistory(); 
    } else {
        alert("Wrong Password!");
    }
}


// Add the Reset function too so the buttons work
async function resetRiderTotal(name) {
    if (confirm(`Reset ${name}'s earnings to 0?`)) {
        const { error } = await window.supabase
            .from('riders')
            .update({ total_earnings: 0 })
            .eq('name', name);
            
        if (!error) alert("Reset successful!");
    }
}

function handleSearch() {
    const query = document.getElementById('app-search').value.toLowerCase().trim();
    
    // If the search bar is empty, just show the main Areas again
    if (query === "") {
        showAreas();
        return;
    }

    breadcrumb.innerHTML = `Searching for: "${query}"`;
    breadcrumb.onclick = showAreas;
    container.innerHTML = "";
    container.style.gridTemplateColumns = "1fr 1fr";

    // Loop through all data to find matching buildings
    Object.keys(data).forEach(areaName => {
        data[areaName].buildings.forEach(buildingObj => {
            if (buildingObj.name.toLowerCase().includes(query)) {
                const card = document.createElement('div');
                card.className = 'card';
                card.style.backgroundImage = `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0)), url('${buildingObj.img}')`;
                card.innerHTML = `<h3>${buildingObj.name}</h3><small style="color:white; z-index:2;">in ${areaName}</small>`;
                
                // Clicking a search result takes you straight to that building's riders
                card.onclick = () => showRiders(areaName, buildingObj.name);
                container.appendChild(card);
            }
        });
    });

    // If no buildings were found, show a message
    if (container.innerHTML === "") {
        container.innerHTML = `<p style="grid-column: span 2; color: #666; margin-top: 20px;">No buildings found matching "${query}"</p>`;
    }
}



function refreshAdminData() {
    const listContainer = document.getElementById('admin-rider-list');
    if (!listContainer) return;

    // This creates a "Live Link" to the cloud
    window.fs(window.supabase.doc(window.db, "system", "totals"), (docSnap) => {
        listContainer.innerHTML = "";
        let grandTotal = 0;

        if (docSnap.exists()) {
            const data = docSnap.data();
            Object.keys(approvedRiders).forEach(riderName => {
                const riderTotal = data[riderName] || 0;
                grandTotal += riderTotal;

                const row = document.createElement('div');
                row.style = "padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;";
                row.innerHTML = `
                    <div><strong>${riderName}</strong></div>
                    <div style="text-align:right;">
                        <span style="font-weight:bold; color:var(--primary);">KSh ${riderTotal.toLocaleString()}</span>
                    </div>
                `;
                listContainer.appendChild(row);
            });
        }
        document.getElementById('system-grand-total').innerText = `KSh ${grandTotal.toLocaleString()}`;
    });
}

function confirmCash() {
    if (typedAmount === "0") return;
    if (confirm(`Log KSh ${typedAmount} as CASH payment?`)) {
        updateDailyEarnings(typedAmount, 'Cash'); // Pass 'Cash' here
        closeRiderView();
    }
}

async function fetchDailyHistory() {
    const list = document.getElementById('history-list');
    document.getElementById('history-section').classList.remove('hidden');
    list.innerHTML = "<p>Loading today's logs...</p>";

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Fetch ONLY today's records from Supabase
    const { data, error } = await window.supabase
        .from('daily_history')
        .select('*')
        .eq('created_at', today) // Filter for today only
        .order('rider_name', { ascending: true });

    if (error) {
        list.innerHTML = "<p style='color:red;'>Error: " + error.message + "</p>";
        return;
    }

    if (data.length === 0) {
        list.innerHTML = "<p>No earnings archived for today yet.</p>";
        return;
    }

    list.innerHTML = "";
    data.forEach(log => {
        const row = document.createElement('div');
        row.style = "padding:12px; border-bottom:1px solid #eee; display:flex; justify-content:space-between;";
        row.innerHTML = `
            <span><strong>Today</strong> - ${log.rider_name}</span>
            <span style="color:var(--primary); font-weight:bold;">KSh ${log.amount.toLocaleString()}</span>
        `;
        list.appendChild(row);
    });
}







// Force clear the search bar after the browser tries to autofill it
window.onload = () => {
    setTimeout(() => {
        const searchBar = document.getElementById('app-search');
        if (searchBar) {
            searchBar.value = "";
            searchBar.setAttribute('autocomplete', 'new-password');
        }
    }, 100); 
};

// Manually wipe login fields on load
window.addEventListener('load', () => {
    setTimeout(() => {
        const nameField = document.getElementById('rider-portal-id');
        const keyField = document.getElementById('rider-portal-key');
        if (nameField) nameField.value = "";
        if (keyField) keyField.value = "";
    }, 50); 
});

// START THE APP
showAreas();

// LISTEN FOR FIREBASE READY
window.addEventListener('firebase-ready', () => {
    if (currentLoggedInRider) loadRiderStats(currentLoggedInRider);
});

