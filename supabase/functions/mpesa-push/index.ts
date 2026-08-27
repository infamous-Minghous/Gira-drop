import { createClient } from "npm:@supabase/supabase-js@2.45.4"
// 🟩 FIXED PRODUCTION CORS HEADERS MATRIX
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Permits your local computer port to connect securely
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS" // Whitelists request types explicitly
}



const supabaseAdminClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
)

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { amount, phone, riderId } = await req.json()

    // 1. INPUT PARAMETER SANITIZATION RUNTIME PASS
    if (!amount || !phone || !riderId) {
      throw new Error("⚠️ Parameter Validation Error: Missing transaction attributes.");
    }

    const cleanAmount = parseInt(amount, 10)
    if (isNaN(cleanAmount) || cleanAmount <= 0 || cleanAmount > 7000) {
      throw new Error("⚠️ Financial Policy: Invalid order checkout transaction amount requested.");
    }

    // Intercept text placeholders and substitute a real numeric sandbox test number
    let cleanStudentPhone = phone.toString().trim()

    if (cleanStudentPhone === "GIRA_ANONYMOUS_PAY" || isNaN(Number(cleanStudentPhone.replace(/\D/g, '')))) {
      cleanStudentPhone = "254708374149" 
    } else {
      cleanStudentPhone = cleanStudentPhone.replace(/\D/g, '')
      if (cleanStudentPhone.startsWith('0')) {
        cleanStudentPhone = '254' + cleanStudentPhone.substring(1)
      }
    }

    if (cleanStudentPhone.length !== 12 || !(cleanStudentPhone.startsWith('2547') || cleanStudentPhone.startsWith('2541'))) {
      throw new Error("⚠️ Format Constraint: Provided phone routing string does not match Kenyan network paths.");
    }

    // 2. ADAPTIVE COURIER MAPPING
    let finalRiderName = riderId 

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidRegex.test(riderId)) {
      const { data: profile } = await supabaseAdminClient
        .from("riders")
        .select("name")
        .eq("id", riderId)
        .maybeSingle()
      if (profile) finalRiderName = profile.name
    } else {
      const localRegistry: Record<string, string> = { "RD001": "Bravin", "RD002": "Mercy", "RD003": "John" }
      if (localRegistry[riderId]) finalRiderName = localRegistry[riderId]
    }

    // 3. PARSE SYSTEM SECRETS ENV STRINGS FROM DEPLOYMENT VAULTS
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY")!
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET")!
    const shortcode = Deno.env.get("MPESA_SHORTCODE") || "174379"
    const passkey = Deno.env.get("MPESA_PASSKEY") || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
    const projectBaseUrl = Deno.env.get("SUPABASE_URL")!

    const mpesaBaseUrl = "https://safaricom.co.ke"

    // 4. GENERATE SECURE DARAJA GATEWAY JWT AUTH OAUTH TOKEN
    const authCredentials = btoa(`${consumerKey}:${consumerSecret}`)
    const tokenResponse = await fetch(`${mpesaBaseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: { "Authorization": `Basic ${authCredentials}` },
    })
    
    if (!tokenResponse.ok) {
      throw new Error("❌ API Security Handshake Failed: Safaricom credentials verification rejected.")
    }
    const { access_token } = await tokenResponse.json()

    // 5. SECURELY COMPILE YYYYMMDDHHMMSS FORMATTED TIMESTAMP
    const now = new Date()
    const eatOffset = 3 * 60 * 60 * 1000 
    const eatDate = new Date(now.getTime() + eatOffset)
    
    const timestamp = eatDate.getUTCFullYear().toString() +
      String(eatDate.getUTCMonth() + 1).padStart(2, '0') +
      String(eatDate.getUTCDate()).padStart(2, '0') +
      String(eatDate.getUTCHours()).padStart(2, '0') +
      String(eatDate.getUTCMinutes()).padStart(2, '0') +
      String(eatDate.getUTCSeconds()).padStart(2, '0')

    const password = btoa(`${shortcode}${passkey}${timestamp}`)
    const dynamicCallbackUrl = `${projectBaseUrl}/functions/v1/mpesa-callback`

    // 6. BUILD PAYBILL SPECIFIC STK PAYLOAD
    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline", 
      Amount: cleanAmount,
      PartyA: cleanStudentPhone, 
      PartyB: shortcode, 
      PhoneNumber: cleanStudentPhone,
      CallBackURL: dynamicCallbackUrl, 
      AccountReference: `FastDrop_${finalRiderName.slice(0, 10)}`,
      TransactionDesc: `Delivery payment to courier: ${finalRiderName}`,
    }

    // 7. DISPATCH REQUEST
    const darajaStkResponse = await fetch(`${mpesaBaseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPayload),
    })

    if (!darajaStkResponse.ok) {
      const errorText = await darajaStkResponse.text()
      throw new Error(`❌ Daraja Interface Error: Gateway rejected request parameters: ${errorText}`)
    }

    const stkResultData = await darajaStkResponse.json()

    // 8. RECORD PENDING CHECKOUT IN HISTORY LEDGER
    if (stkResultData.ResponseCode === "0" || stkResultData.ResponseCode === 0) {
      const { error: ledgerWriteError } = await supabaseAdminClient
        .from("daily_history")
        .insert([{
          rider_name: finalRiderName, 
          amount: cleanAmount,
          payment_method: "M-Pesa (Pochi)",
          student_phone: phone, 
          checkout_request_id: stkResultData.CheckoutRequestID
        }])

      if (ledgerWriteError) {
        console.error(`Ledger record fail: ${ledgerWriteError.message}`)
      }
    }

    return new Response(JSON.stringify(stkResultData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Unknown System Exception"
  console.error(`❌ STK Process Interrupted: ${errorMessage}`);
  
  // ✅ FIXED: Injects CORS headers into error responses so your front-end console can read the message text!
  return new Response(JSON.stringify({ success: false, error: errorMessage }), {
    status: 400,
    headers: { 
      ...corsHeaders, 
      "Content-Type": "application/json" 
    },
  })
}

})
