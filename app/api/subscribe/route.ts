import { NextRequest, NextResponse } from "next/server";

const hits = new Map<string, number[]>();
function rateLimited(ip: string, max = 5) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < 3600_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > max;
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


const AUDIENCE_ID = process.env.GENETIC_TESTING_AUDIENCE_ID || "";

export async function POST(req: NextRequest) {
  const { email, firstName } = await req.json();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (!email || !EMAIL_RE.test(String(email))) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  if (!process.env.RESEND_API_KEY || !AUDIENCE_ID) return NextResponse.json({ success: true });

  await fetch(`https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, first_name: firstName || "", unsubscribed: false }),
  });

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Genetic Testing Digest <hello@genetictesting.com>",
      to: email,
      subject: "You're subscribed to the Genetic Testing Digest",
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
  <h2 style="color:#0d4a2a;margin:0 0 12px">Welcome to the Genetic Testing Digest</h2>
  <p style="color:#444;line-height:1.6">You're now subscribed. Every Sunday you'll receive curated news, funding rounds, and precision medicine insights from the genetic testing industry.</p>
  <p style="color:#444;line-height:1.6">The next issue lands this Sunday.</p>
  <p style="margin-top:32px"><a href="https://genetictesting.com" style="background:#0d4a2a;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">Visit GeneticTesting.com</a></p>
  <hr style="margin:32px 0;border:none;border-top:1px solid #eee">
  <p style="font-size:12px;color:#999">You're receiving this because you subscribed at genetictesting.com.<br>
  <a href="https://genetictesting.com/unsubscribe?email=${encodeURIComponent(email)}" style="color:#999">Unsubscribe</a></p>
</div>`,
    }),
  });

  return NextResponse.json({ success: true });
}
