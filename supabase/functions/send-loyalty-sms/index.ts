import { serve } from "https://deno.land";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, message } = await req.json();
    const atUsername = Deno.env.get("AT_USERNAME") || "sandbox"; 
    const atApiKey = Deno.env.get("AT_API_KEY")!;
    
    let cleanPhone = to.replace(/[+\s]/g, '');
    if (!cleanPhone.startsWith('254')) {
      if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);
      else if (cleanPhone.startsWith('1')) cleanPhone = '254' + cleanPhone;
    }
    const formattedRecipient = `+${cleanPhone}`;

    console.log(`?? BROADCASTING SMS METRICS: Sending target message via Africa's Talking to: ${formattedRecipient}`);

    const smsPayload = new URLSearchParams();
    smsPayload.append("username", atUsername);
    smsPayload.append("to", formattedRecipient);
    smsPayload.append("message", message);

    const targetEndpoint = atUsername === "sandbox" 
      ? "https://africastalking.com"
      : "https://africastalking.com"; 

    const response = await fetch(targetEndpoint, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "apiKey": atApiKey
      },
      body: smsPayload.toString()
    });

    const responseData = await response.json();
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("? SMS Transmission Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
