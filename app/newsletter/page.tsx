"use client";
import { useState } from "react";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      setStatus("done");
    } catch { setStatus("error"); }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <span className="text-xs font-semibold tracking-widest text-[#0d4a2a] uppercase">Every Sunday</span>
      <h1 className="mt-3 text-4xl font-bold text-gray-900">The Genetic Testing Digest</h1>
      <p className="mt-4 text-lg text-gray-600 leading-relaxed">
        The weekly newsletter for founders, investors, researchers, and clinicians in the genetic testing and genomics space.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4 text-left">
        {[
          ["Top genomics news", "Curated funding rounds, product launches, and research breakthroughs"],
          ["Company spotlight", "Deep-dive on one genetic testing company every week"],
          ["Precision medicine", "Latest in pharmacogenomics, NIPT, and oncology genomics"],
          ["Market insights", "Data and trends shaping the genetic testing industry"],
        ].map(([title, desc]) => (
          <div key={title} className="bg-gray-50 rounded-xl p-4">
            <p className="font-medium text-gray-900 text-sm">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
          </div>
        ))}
      </div>
      {status === "done" ? (
        <div className="mt-10 py-6 bg-[#e8f5ee] rounded-xl">
          <p className="font-semibold text-[#0d4a2a]">You&apos;re subscribed!</p>
          <p className="text-sm text-gray-500 mt-1">First issue lands this Sunday.</p>
        </div>
      ) : (
        <form className="mt-10" onSubmit={handleSubmit}>
          <div className="flex gap-2 max-w-md mx-auto">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
              className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d4a2a]/30 focus:border-[#0d4a2a]" />
            <button type="submit" disabled={status === "loading"}
              className="bg-[#0d4a2a] text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-[#082d19] transition-colors whitespace-nowrap disabled:opacity-60">
              {status === "loading" ? "Subscribing..." : "Subscribe free"}
            </button>
          </div>
          {status === "error" && <p className="mt-2 text-xs text-red-500">Something went wrong. Try again.</p>}
          <p className="mt-3 text-xs text-gray-400">No spam. Unsubscribe anytime.</p>
        </form>
      )}
      <div className="mt-16 border border-gray-100 rounded-2xl p-6 text-left">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">For companies</p>
        <h3 className="font-semibold text-gray-900">Sponsor the Genetic Testing Digest</h3>
        <p className="text-sm text-gray-500 mt-1">Each issue goes to thousands of genomics professionals. Two sponsor slots per issue at $500 each.</p>
        <a href="/advertise#newsletter-sponsor" className="mt-3 inline-block text-sm font-medium text-[#0d4a2a] hover:underline">View sponsorship options →</a>
      </div>
    </div>
  );
}
