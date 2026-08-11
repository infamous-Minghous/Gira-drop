// ==========================================================================
// NATIVE SUPABASE WEB COMPILER CORES - ZERO OUTWARD SERVER MODULE DEPENDENCIES
// ==========================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Uses Deno's native server runtime directly to bypass broken third-party URL module imports completely
Deno.serve(async (req) => {
  // Handle cross-platform browser security preflight check loops natively
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. EXTRACT DATA LAYOUT VALUES FROM THE CLIENT-SIDE APP
    const { amount, phone, riderName } = await req.json();

    // Pull secure environment variables out of your encrypted cloud vault
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY")!;
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET")!;
    const shortcode = Deno.env.get("MPESA_SHORTCODE")!;
    const passkey = Deno.env.get("MPESA_PASSKEY")!;
    
    // COMMERCIAL PRODUCTION ENGINE ENDPOINT GATEWAY
    const mpesaBaseUrl = "https://safaricom.co.ke"; 

    // 2. REQUEST LIVE SAFARICOM OAUTH ACCESS TOKEN
    const authCredentials = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch(`${mpesaBaseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: { "Authorization": `Basic ${authCredentials}` },
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`Safaricom Auth Rejected. Verify Consumer Keys inside your vault.`);
    }
    const { access_token } = await tokenResponse.json();

    // 3. COMPILE PRODUCTION SECURITY TIMESTAMP & PASSWORD STRINGS (East Africa Zone Time)
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" })
      .replace(/[^0-9]/g, "").slice(0, 14); // Format: YYYYMMDDHHMMSS
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // 4. PREPARE THE RAW LIPA NA M-PESA STK PUSH DATA PAYLOAD MATRIX
    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerBuyGoodsOnline", // Targets Till / Pochi commercial lines
      Amount: Math.round(amount),
      PartyA: phone, 
      PartyB: shortcode, 
      PhoneNumber: phone,
      CallBackURL: `https://supabase.co`, 
      AccountReference: `FastDrop`,
      TransactionDesc: `Campus delivery payment via rider: ${riderName}`,
    };

    console.log(`📡 Relaying payload up to Safaricom channels for shortcode ${shortcode}, amount: KSh ${amount}`);

    // 5. BROADCAST TRANSMISSION PACKET TO SAFARICOM TOWERS
    const darajaStkResponse = await fetch(`${mpesaBaseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPayload),
    });

    const stkResultData = await darajaStkResponse.json();

    // Echo Safaricom's live receipt package right back down to your frontend client script
    return new Response(JSON.stringify(stkResultData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("❌ M-Pesa Edge Function Crash Exception:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
