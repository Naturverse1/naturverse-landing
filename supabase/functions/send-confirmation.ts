import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    const { error } = await resend.emails.send({
      from: "Naturverse <noreply@naturverse.com>",
      to: email,
      subject: "Thanks for joining the Naturverse!",
      html: `<p>Hi ${name},</p><p>Thanks for joining the waitlist.</p>`,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Confirmation email sent" },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

