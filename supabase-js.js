/*! Multi-Chain Offline Sandbox Bypass with maybeSingle support */
(function(global) {
    global.supabase = {
        createClient: function(url, key) {
            console.log("🟩 Offline Sandbox Active: Fully Upgraded `.maybeSingle()` Chain Engaged!");
            
            // Advanced chain builder mimicking native Supabase SDK behaviors accurately
            const chainBuilder = {
                eq: function(column, value) { 
                    return chainBuilder; 
                },
                select: function(columns) { 
                    return chainBuilder; 
                },
                // Emulates the newly added data resolution block method
                maybeSingle: async function() {
                    return {
                        data: { rider_name: "Bravin" }, // Returns a valid mock profile object row mapping matching script.js requirements
                        error: null
                    };
                }
            };

            return {
                from: function(table) {
                    return chainBuilder;
                }
            };
        }
    };
})(this);
