// ==========================================================================
// SUPABASE EDGE FUNCTION: AUTOMATED CAMPUS DELIVERY NOTIFICATION ENGINE
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
    // 1. EXTRACT DATA PARAMETERS FROM FRONTEND TRIGGER DISPATCHES
    const { studentPhone, textMessage, riderName, buildingTarget } = await req.json();

    if (!studentPhone) throw new Error("Missing required subscriber phone parameter routing link.");

    // Pull secure environment credentials out of your encrypted cloud vault
    const atUsername = Deno.env.get("AT_USERNAME") || "sandbox";
    const atApiKey = Deno.env.get("AT_API_KEY")!;
    const atSenderId = Deno.env.get("AT_SENDER_ID"); 

    // 2. FORMULATE DYNAMIC CAMPUS NOTIFICATION TEXT COPY
    const finalSMSMessage = textMessage || `🚀 FastDrop Dispatch! Your delivery rider ${riderName || 'is active'} has logged your checkout and is heading to ${buildingTarget || 'your location'} right now. Get ready!`;

    // 3. COMPILE AFRICA'S TALKING URL-ENCODED PARAMETERS FORM DATA PAYLOAD
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

    console.log(`📡 Relaying dispatch alert via Africa's Talking [${atUsername}] up to target phone: ${studentPhone}`);

    // 5. BROADCAST TELECOM TRANSMISSION PACKETS VIA FETCH API
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

    return new Response(JSON.stringify(atTelecomResultData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("❌ Africa's Talking Loyalty System Core Exception Caught:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
