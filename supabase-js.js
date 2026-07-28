/*! Master Offline Sandbox Bypass for Maseno Fast-Drop Testing */
(function(global) {
    global.supabase = {
        createClient: function(url, key) {
            console.log("🟩 Master Sandbox Engaged: All Rider and Admin Database Tracks Emulated!");
            
            // Reusable infinite builder allowing cascading .eq() and .select() parameters
            const chainBuilder = {
                eq: function(column, value) { 
                    return chainBuilder; 
                },
                select: function(columns) { 
                    return chainBuilder; 
                },
                gte: function(col, val) {
                    return chainBuilder;
                },
                lte: function(col, val) {
                    return chainBuilder;
                },
                // 1. Handles your Section 7 worker portal login handshake
                maybeSingle: async function() {
                    return {
                        data: { rider_name: "Bravin", access_level: "master" }, 
                        error: null
                    };
                },
                // 2. Handles administrative summaries, metrics lookups, and worker stats loops
                then: function(resolve) {
                    // Mocks typical live repository tables arrays to populate admin cards automatically
                    return resolve({
                        data: [
                            { name: "Bravin", total_earnings: 1250, current_status: "At Complex Gate" },
                            { name: "Mercy", total_earnings: 800, current_status: "Waiting at Hollywood" },
                            { name: "John", total_earnings: 2100, current_status: "Outside Tsunami" }
                        ],
                        error: null
                    });
                }
            };

            return {
                from: function(table) {
                    console.log(`📡 [MOCK FEED] Intercepting request directed to table: ${table}`);
                    return chainBuilder;
                },
                channel: function(id) {
                    return {
                        on: function(ev, target, callback) {
                            return this;
                        },
                        subscribe: function(callback) {
                            if (typeof callback === 'function') callback('SUBSCRIBED');
                            return this;
                        }
                    };
                },
                removeChannel: function(chan) {
                    return true;
                }
            };
        }
    };
})(this);
