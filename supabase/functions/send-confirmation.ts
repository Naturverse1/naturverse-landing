import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { email, name, selectedOption } = await req.json();

    const { data, error } = await resend.emails.send({
      from: "Naturverse <noreply@naturverse.com>",
      to: email,
      subject: "Thanks for joining the Naturverse!",
      html: `<p>Hi ${name},</p><p>Thanks for joining the waitlist with the option: ${selectedOption}.</p>`,
    });

    if (error) {
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: "success", id: data?.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { status: "error", message: (err as Error).message },
      { status: 400 },
    );
  }
}

