import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') || "");

serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { email, name, selectedOption } = await req.json();

    await resend.emails.send({
      from: "no-reply@naturverse.com",
      to: email,
      subject: "🌱 Welcome to The Naturverse!",
      html: `<p>Hello ${name},</p><p>Thank you for joining the waitlist with the option: ${selectedOption}.</p>`,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
