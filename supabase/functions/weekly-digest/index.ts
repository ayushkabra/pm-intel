import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

Deno.serve(async (req) => {
  if (!resendApiKey || !supabaseUrl || !supabaseServiceKey) {
    return new Response("Missing environment variables", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Fetch all workspaces where digest is enabled
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('*, users:user_id(email)')
    .eq('digest_enabled', true);

  if (error || !workspaces) {
    console.error("Error fetching workspaces:", error);
    return new Response("Error fetching workspaces", { status: 500 });
  }

  let sentCount = 0;

  // 2. Loop through each opted-in workspace
  for (const workspace of workspaces) {
    // Note: Due to how foreign keys work, 'users' might be an object or array depending on the relationship.
    const userEmail = Array.isArray(workspace.users) ? workspace.users[0]?.email : workspace.users?.email;
    if (!userEmail) continue;

    // In a real app, you would call Anthropic/OpenAI here using the workspace.competitors list
    const aiReport = `Here is your weekly competitive digest for ${workspace.company}.`;

    try {
      // 3. Send email via Resend
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'PM Intel <hello@yourdomain.com>', // Update this once you verify your domain on Resend
          to: [userEmail],
          subject: `Your Weekly Intel: ${workspace.company}`,
          html: `<h2>Weekly Digest</h2><p>${aiReport}</p>`
        })
      });

      if (res.ok) {
        sentCount++;
        console.log(`Successfully sent email to ${userEmail}`);
      } else {
        const errorData = await res.text();
        console.error(`Failed to send email to ${userEmail}:`, errorData);
      }
    } catch (err) {
      console.error(`Error sending email to ${userEmail}:`, err);
    }
  }

  return new Response(JSON.stringify({ success: true, sent: sentCount }), {
    headers: { "Content-Type": "application/json" },
  });
});
