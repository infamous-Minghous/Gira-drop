// ==========================================================================
// AUTOMATED STUDENT LOYALTY MILESTONE TEXT MESSAGE ENGINE
// ==========================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle cross-platform browser security preflight check loops natively
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. EXTRACT DATA PARAMETERS SENT BY YOUR LOYALTY LIFECYCLE
    const { studentPhone, textMessage, orderCount } = await req.json();

    if (!studentPhone) throw new Error("Missing required subscriber phone parameter routing link.");

    // Pull secure environment credentials directly out of your encrypted cloud vault
    const atUsername = Deno.env.get("AT_USERNAME") || "sandbox"; // Defaults to Africa's Talking sandbox framework
    const atApiKey = Deno.env.get("AT_API_KEY")!;
    const atSenderId = Deno.env.get("AT_SENDER_ID"); // Optional custom alpha-numeric shortcode string

    // 2. FORMULATE THE DYNAMIC TEXT COPY TEMPLATE
    // Fallback composition framework if the calling script doesn't supply explicit notification strings
    const finalSMSMessage = textMessage || `🎉 Maseno Fast-Drop loyalty update!\n\nYou have completed delivery round #${orderCount || 1}.\n\nKeep ordering to unlock your next 100% FREE campus delivery run reward!`;

    // 3. COMPILE AFRICA'S TALKING URL-ENCODED DATA PARAMETERS BLOCK
    // Africa's Talking requires a strict form-urlencoded payload structure rather than JSON text cells
    const payloadFields = new URLSearchParams();
    payloadFields.append("username", atUsername);
    payloadFields.append("to", studentPhone.trim());
    payloadFields.append("message", finalSMSMessage);
    
    if (atSenderId) {
        payloadFields.append("from", atSenderId.trim());
    }

    // 4. DEFINE AIRTIGHT INFRASTRUCTURE TARGET ENDPOINTS FLUIDLY
    const isSandboxEnvironment = atUsername.toLowerCase() === "sandbox";
    const atGatewayEndpointUrl = isSandboxEnvironment
      ? "https://africastalking.com"
      : "https://africastalking.com";

    console.log(`📡 Relaying automated alert via Africa's Talking [${atUsername}] up to recipient device: ${studentPhone}`);

    // 5. BROADCAST RAW TELECOM PACKETS TO CELLULAR CARRIERS VIA FETCH API
    const response = await fetch(atGatewayEndpointUrl, {
      method: "POST",
      headers: {
        "ApiKey": atApiKey,
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payloadFields.toString(),
    });

    const atTelecomResultData = await response.json();

    // Echo telecom receipt package parameters back to your calling triggers
    return new Response(JSON.stringify(atTelecomResultData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("❌ Africa's Talking SMS Core Function Crash Exception Caught:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
