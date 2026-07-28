// FIXED LINE 1: Added complete file path allocation parameters for standard Deno server models
import { serve } from "https://deno.land";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight handshakes natively to keep frontend browsers happy
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, phone, riderName } = await req.json();

    // Load protected environment secret keys securely out of your cloud vault
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY")!;
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET")!;
    const shortcode = Deno.env.get("MPESA_SHORTCODE")!;
    const passkey = Deno.env.get("MPESA_PASSKEY")!;
    
    // For Sandbox use: "https://safaricom.co.ke"
    // FIXED LINE 23: Swapped live root domain destination paths for standard Sandbox simulation targets
const mpesaBaseUrl = "https://safaricom.co.ke";


    // GENERATE OAUTH ACCESS TOKEN: Authenticate with Safaricom cell towers
    const authCredentials = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch(`${mpesaBaseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: { "Authorization": `Basic ${authCredentials}` },
    });
    
    const { access_token } = await tokenResponse.json();

    // COMPILE SECURITY TIMESTAMP & PASSWORD STRINGS
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14); // Format: YYYYMMDDHHMMSS
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // BROADCAST THE ATOMIC LIPA NA M-PESA STK PUSH PAYLOAD
    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline", 
      Amount: Math.round(amount),
      PartyA: phone, 
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: `https://supabase.co`, 
      AccountReference: `FastDrop_${riderName}`,
      TransactionDesc: `Campus Delivery Payment for ${riderName}`,
    };

    const darajaStkResponse = await fetch(`${mpesaBaseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPayload),
    });

    const stkResultData = await darajaStkResponse.json();

    return new Response(JSON.stringify(stkResultData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

