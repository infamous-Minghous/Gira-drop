// ==========================================================================
// PRODUCTION-HARDENED EDGE FUNCTION: MPESA WEBHOOK WEB RECEIVER RECONCILER
// ==========================================================================

// FIXED IMPORT PATH: Dynamically tracks the official Supabase repository layers smoothly
import { createClient } from "npm:@supabase/supabase-js@2.45.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Elevated Service-Role instance securely processes ledger updates on the server
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
    const payload = await req.json()
    console.log("📥 Inbound Webhook Received: Staging raw Safaricom telemetry payload packet.")

    // 1. Structural Verification: Protect engine loops against corrupted runtime arrays
    if (!payload?.Body?.stkCallback) {
      throw new Error("Fintech Security Block: Incoming request payload layout is malformed.");
    }

    const callbackData = payload.Body.stkCallback
    const resultCode = callbackData.ResultCode
    const checkoutRequestID = callbackData.CheckoutRequestID

    // 2. AUDIT VAULT REGISTRATION: Permanent capture of raw JSON tracking metrics
    const { error: callbackLogErr } = await supabaseAdminClient
      .from("mpesa_callbacks")
      .insert([{
        checkout_request_id: checkoutRequestID,
        raw_payload: payload,
        processed_successfully: resultCode === 0
      }])

    if (callbackLogErr) {
      console.error(`🟥 Audit Alert: Unable to log raw tracking signature: ${callbackLogErr.message}`)
    }

    // 3. User Cancellation Guard
    if (resultCode !== 0) {
      console.warn(`⚠️ Transaction Dropped: User aborted prompt or line holds insufficient funds. Request ID: ${checkoutRequestID}`)
      return new Response(JSON.stringify({ success: false, message: "Transaction unverified." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // 4. METRICS INGESTION STRIP: Strict lookup of transaction parameters
    const metadataItems = callbackData.CallbackMetadata?.Item || []
    
    const amountNode = metadataItems.find((item: any) => item.Name === "Amount")
    const receiptNode = metadataItems.find((item: any) => item.Name === "MpesaReceiptNumber")

    const paidAmount = amountNode ? parseFloat(amountNode.Value) : 0
    const mpesaReceiptNumber = receiptNode ? receiptNode.Value.toString().trim() : null

    if (!mpesaReceiptNumber || paidAmount <= 0) {
      throw new Error("Security Alert: Critical Safaricom receipt parameters are missing from packet data columns.")
    }

    console.log(`🟩 Verification Success: Code ${mpesaReceiptNumber} extracted. Processing payment payout blocks live...`)

    // 5. ATOMIC DATABASE RPC PIPE ROUTER (ZERO JAVASCRIPT CONCURRENCY RACE FAULTS)
    // Invokes your database function to update history status, riders, and student profiles simultaneously
    const { error: rpcExecutionError } = await supabaseAdminClient
      .rpc("process_verified_transaction", {
        target_checkout_id: checkoutRequestID,
        safari_receipt: mpesaReceiptNumber,
        payment_value: Math.round(paidAmount)
      })

    if (rpcExecutionError) {
      throw new Error(`Database Ledger Transaction Rejected: ${rpcExecutionError.message}`)
    }

    // Update vault audit verification flag cell cleanly upon full ledger resolution
    await supabaseAdminClient
      .from("mpesa_callbacks")
      .update({ processed_successfully: true })
      .eq("checkout_request_id", checkoutRequestID)

    console.log(`🎉 Absolute Resolution Complete: Ledger records locked down for Checkout Request ID: ${checkoutRequestID}`)

    return new Response(JSON.stringify({ success: true, message: "Fintech ledger entries updated successfully." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown Callback Error"
    console.error(`🟥 Fatal Handshake Interruption Error: ${errorMessage}`)
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
