/*! Multi-Chain Offline Sandbox Bypass for Maseno Fast-Drop Testing */
(function(global) {
    global.supabase = {
        createClient: function(url, key) {
            console.log("🟩 Offline Sandbox Active: Advanced Multi-Chain Matrix Engaged!");
            
            // Reusable mock builder allowing infinite parameter chain stacking
            const chainBuilder = {
                eq: function(column, value) { 
                    return chainBuilder; 
                },
                select: function(columns) { 
                    return chainBuilder; 
                },
                // Emulates successful resolution returning a valid worker data object array row
                then: function(resolve) {
                    return resolve({
                        data: [{ rider_name: "Bravin" }], 
                        error: null
                    });
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
