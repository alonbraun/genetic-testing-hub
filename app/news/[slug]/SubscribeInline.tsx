"use client";
import { useState } from "react";

export default function SubscribeInline() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {}
    setStatus("done");
  }

  return (
    <div className="mt-10 bg-[#0a2818] rounded-2xl p-6 sm:p-8">
      {status === "done" ? (
        <p className="text-[#8ee6c0] font-medium text-center">✅ You're in — the next genomics digest is on its way.</p>
      ) : (
        <>
          <p className="text-white font-semibold text-lg">Stay ahead in genomics</p>
          <p className="text-[#8ee6c0] text-sm mt-1 mb-4">Funding rounds, FDA clearances, and precision-medicine moves — weekly, free.</p>
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#2db87d]"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-[#2db87d] text-[#0a2818] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#4ecf97] transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "…" : "Subscribe free"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
