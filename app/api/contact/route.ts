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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { company, email, message } = body;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Bot defenses: honeypot field, rate limit, validation
  if (body.website) return NextResponse.json({ success: true }); // honeypot — pretend success
  if (rateLimited(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (!company || !email || !EMAIL_RE.test(String(email)) || String(company).length > 120 || String(message || "").length > 2000) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }
  // Gibberish detector: random-string company/message (e.g. "OPgipbYBtuKcdIVMbdOzqeGA")
  const RANDOM_RE = /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z0-9]{12,}$/;
  const gibberish = [company, message].some(v => {
    const s = String(v || "").trim();
    return RANDOM_RE.test(s) || (s.length > 12 && !s.includes(" ") && /[A-Z]/.test(s.slice(1)));
  });
  if (gibberish) return NextResponse.json({ ok: true }); // swallow silently like honeypot

  if (process.env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "GeneticTesting Contact <hello@genetictesting.com>",
        to: "alonbraun@me.com",
        subject: `GeneticTesting.com advertise inquiry: ${company}`,
        html: `<p><strong>Company:</strong> ${company}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`,
      }),
    });
  }

  return NextResponse.json({ success: true });
}
