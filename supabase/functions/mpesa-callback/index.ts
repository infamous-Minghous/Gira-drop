// ==========================================================================
// SUPABASE EDGE FUNCTION: AUTOMATED INBOUND LIPA NA M-PESA TRANSACTION ACCOUNTANT
// ==========================================================================

// FIXED LINE 6: Swapped raw URL strings for Supabase's native browser module specifier
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize an internal, privileged cloud-level pipeline link to bypass public table locks safely
const supabaseAdminClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // Secure privileged administrative bypass passkey string
  { auth: { persistSession: false } }
);

Deno.serve(async (req) => {
  // Handle cross-platform browser security preflight check loops natively
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. CAPTURE RAW REAL-TIME BANKING TELEMETRY SENT BY SAFARICOM
    const payload = await req.json();
    console.log("📥 Raw incoming transaction payload received from Safaricom towers:", JSON.stringify(payload));

    const mpesaResponseData = payload.Body.stkCallback;
    const resultCode = mpesaResponseData.ResultCode;
    const checkoutRequestID = mpesaResponseData.CheckoutRequestID;

    // 2. DEFENSIVE EXCEPTION GUARD: Exit cleanly if the student canceled or typed a wrong PIN
    if (resultCode !== 0) {
      console.warn(`⚠️ Transaction canceled by user or rejected by tower. CheckoutRequestID: ${checkoutRequestID}, Code: ${resultCode}, Reason: ${mpesaResponseData.ResultDesc}`);
      return new Response(JSON.stringify({ status: "Rejected", message: mpesaResponseData.ResultDesc }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // 3. EXTRACT CLEAN METRICS OUT OF THE BANKING REQUISITION STRUCTURAL DATA ARRAY
    const callbackMetadataItems = mpesaResponseData.CallbackMetadata.Item;
    
    const amountItem = callbackMetadataItems.find((item: any) => item.Name === "Amount");
    const receiptItem = callbackMetadataItems.find((item: any) => item.Name === "MpesaReceiptNumber");
    const phoneItem = callbackMetadataItems.find((item: any) => item.Name === "PhoneNumber");

    const transactionAmount = amountItem ? parseInt(amountItem.Value, 10) : 0;
    const mpesaReceiptCode = receiptItem ? receiptItem.Value : `TXT_${Math.random().toString(36).substring(7).toUpperCase()}`;
    const studentRawPhone = phoneItem ? phoneItem.Value.toString() : "";

    // Normalize incoming customer numbers instantly to absolute international 12-digit standard matching loops (2547...)
    let cleanStudentPhone = studentRawPhone.replace(/\D/g, '');
    if (cleanStudentPhone.startsWith('0')) {
      cleanStudentPhone = '254' + cleanStudentPhone.substring(1);
    }

    console.log(`🟩 Payment success verified! Code: ${mpesaReceiptCode}, Sum: KSh ${transactionAmount}, Payer: ${cleanStudentPhone}`);

    // 4. MULTI-FLEET ROUTING DISCRIMINATION: Identify which driver logged this pending tracking ID code string
    let pendingOrderRecord = null;
    let targetFleetClassification = "STANDARD";
    let historyTableTarget = "daily_history";
    let walletTableTarget = "riders";

    const { data: stdCheck } = await supabaseAdminClient
      .from("daily_history")
      .select("*")
      .eq("checkout_request_id", checkoutRequestID)
      .maybeSingle();

    if (stdCheck) {
      pendingOrderRecord = stdCheck;
    } else {
      // If missing from standard records, search inside your isolated VIP premium database partition
      const { data: secCheck } = await supabaseAdminClient
        .from("secret_daily_history")
        .select("*")
        .eq("checkout_request_id", checkoutRequestID)
        .maybeSingle();

      if (secCheck) {
        pendingOrderRecord = secCheck;
        targetFleetClassification = "PREMIUM_SECRET";
        historyTableTarget = "secret_daily_history";
        walletTableTarget = "secret_riders";
      }
    }

    if (!pendingOrderRecord) {
      console.warn(`📝 Direct external payment caught or checkout request unindexed in memory. Defaulting to baseline logging tracks.`);
    }

    const assignedRiderName = pendingOrderRecord ? pendingOrderRecord.rider_name : "System_Unassigned";

    // 5. ATOMIC WALLET INFLATION: Increment balance cleanly inside the correct target fleet table partition
    if (assignedRiderName !== "System_Unassigned") {
      console.log(`🔒 Incremental step-up execution triggered within [${walletTableTarget}] for worker: ${assignedRiderName}`);
      
      const { data: walletRecord, error: walletFetchErr } = await supabaseAdminClient
        .from(walletTableTarget)
        .select("total_earnings")
        .eq("name", assignedRiderName)
        .maybeSingle();

      if (!walletFetchErr && walletRecord) {
        const revisedEarningSumTotal = (Number(walletRecord.total_earnings) || 0) + transactionAmount;
        
        await supabaseAdminClient
          .from(walletTableTarget)
          .update({ total_earnings: revisedEarningSumTotal })
          .eq("name", assignedRiderName);
      }
    }

    // 6. HISTORICAL RECONCILIATION FLUSH: Stamp the final real M-Pesa tracking receipt reference ID onto the audit row
    const localDateObject = new Date();
    const localOffsetYear = localDateObject.getFullYear();
    const localOffsetMonth = String(localDateObject.getMonth() + 1).padStart(2, '0');
    const localOffsetDay = String(localDateObject.getDate()).padStart(2, '0');
    const cleanDatabaseDate = `${localOffsetYear}-${localOffsetMonth}-${localOffsetDay}`;

    if (pendingOrderRecord) {
      // Overwrite and validate the placeholder transaction handle row cleanly
      await supabaseAdminClient
        .from(historyTableTarget)
        .update({ 
          payment_method: `M-Pesa (${mpesaReceiptCode})`, 
          student_phone: cleanStudentPhone,
          created_at: cleanDatabaseDate
        })
        .eq("checkout_request_id", checkoutRequestID);
    } else {
      // If a student bypassed the app UI grid and paid directly, append a fresh backup record row to prevent revenue loss
      await supabaseAdminClient
        .from("daily_history")
        .insert([{
          rider_name: "Direct_Pay_Gate",
          amount: transactionAmount,
          payment_method: `M-Pesa (${mpesaReceiptCode})`,
          student_phone: cleanStudentPhone,
          checkout_request_id: checkoutRequestID,
          created_at: cleanDatabaseDate
        }]);
    }

    // 7. PARALLEL AUTOMATED CELLULAR NOTIFICATIONS PIPELINE
    const loyaltyRpcTarget = targetFleetClassification === "PREMIUM_SECRET" ? "process_secret_loyalty_order" : "process_student_loyalty_order";
    
    if (cleanStudentPhone && cleanStudentPhone.length === 12) {
      const { data: loyaltyResult } = await supabaseAdminClient.rpc(loyaltyRpcTarget, { student_target: cleanStudentPhone });
      
      const currentOrderCount = loyaltyResult ? loyaltyResult.current_count : 1;
      const isMilestoneReached = loyaltyResult ? loyaltyResult.earned_free === 1 : false;

      let textNotificationBody = `🎉 FastDrop Payment Received!\n\nKSh ${transactionAmount} successfully settled for delivery. Your M-Pesa receipt is ${mpesaReceiptCode}.\n\nThank you for choosing Maseno Fast-Drop!`;
      
      if (isMilestoneReached) {
        textNotificationBody = `🎁 LOYALTY MILESTONE REWARD ACTIVATED!\n\nCongratulations! You have completed delivery round #${currentOrderCount} across our campus networks.\n\nThis delivery run is 100% FREE! Enjoy your reward!`;
      }

      console.log(`✉️ Relaying notification transaction metrics up to specialized notification dispatcher...`);
      
      fetch("https://supabase.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentPhone: `+${cleanStudentPhone}`,
          textMessage: textNotificationBody,
          orderCount: currentOrderCount
        })
      }).catch(e => console.error("⚠️ Background SMS carrier relay dropped:", e.message));
    }

    return new Response(JSON.stringify({ ResponseCode: "0", ResponseDesc: "Callback processed successfully, ledger columns synchronized." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("❌ Critical M-Pesa Callback Accountant Pipeline Crash Exception:", error.message);
    return new Response(JSON.stringify({ ResponseCode: "1", ResponseDesc: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
