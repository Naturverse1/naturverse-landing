import { serve } from "https://deno.land/std/http/server.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");

export default serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { email, name, selectedOption } = await req.json();

    const { data, error } = await resend.emails.send({
      from: "Naturverse <noreply@naturverse.com>",
      to: email,
      subject: "Thanks for joining the Naturverse!",
      html: `<p>Hi ${name},</p><p>Thanks for joining the waitlist with the option: ${selectedOption}.</p>`,
    });

    if (error) {
      return new Response(
        JSON.stringify({ status: "error", message: error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ status: "success", id: data?.id }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ status: "error", message: (err as Error).message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
