import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GeneticTesting.com — The Genetic Testing Industry Hub",
  description: "The go-to resource for genetic testing companies, genomics news, and precision medicine insights.",
  openGraph: {
    title: "GeneticTesting.com — The Genetic Testing Industry Hub",
    description: "The go-to resource for genetic testing companies, genomics news, and precision medicine insights.",
    url: "https://genetictesting.com",
    siteName: "GeneticTesting.com",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`} style={{ colorScheme: "light" }}>
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-3KY81PM6M7" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3KY81PM6M7');
        `}</Script>
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-[family-name:var(--font-geist-sans)]">
        <header className="sticky top-0 z-50 bg-[#0a2818]/95 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5">
              <span className="text-[#2db87d] font-semibold text-xl tracking-tight">GeneticTesting</span>
              <span className="text-[#2a6b47] font-normal text-xl">.com</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {[
                ["Directory", "/directory"],
                ["News", "/news"],
                ["Newsletter", "/newsletter"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="px-4 py-2 text-sm text-[#86d4a8] hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  {label}
                </Link>
              ))}
              <Link href="/advertise" className="ml-3 bg-[#0d4a2a] hover:bg-[#0f5c32] text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium">
                Advertise
              </Link>
            </nav>
            <button className="md:hidden text-[#86d4a8] p-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-[#071a0f] border-t border-white/5 pt-14 pb-8 mt-20">
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid md:grid-cols-4 gap-10 mb-10">
              <div className="md:col-span-2">
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-[#2db87d] font-semibold text-lg">GeneticTesting</span>
                  <span className="text-[#2a6b47] text-lg">.com</span>
                </div>
                <p className="text-[#4a8f6b] text-sm leading-relaxed max-w-xs">
                  The definitive resource for the genetic testing industry — companies, news, and precision medicine insights.
                </p>
              </div>
              <div>
                <p className="text-[#86d4a8] text-sm font-medium mb-4">Explore</p>
                <div className="flex flex-col gap-2.5">
                  {[["Directory", "/directory"], ["News", "/news"], ["Newsletter", "/newsletter"]].map(([l, h]) => (
                    <Link key={h} href={h} className="text-[#4a8f6b] text-sm hover:text-[#86d4a8] transition-colors">{l}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[#86d4a8] text-sm font-medium mb-4">Partners</p>
                <div className="flex flex-col gap-2.5">
                  {[["Newsletter", "/newsletter"], ["Advertise", "/advertise"], ["List your company", "/advertise"]].map(([l, h]) => (
                    <Link key={l} href={h} className="text-[#4a8f6b] text-sm hover:text-[#86d4a8] transition-colors">{l}</Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[#2a6b47] text-xs">© 2026 GeneticTesting.com. All rights reserved.</p>
              <p className="text-[#2a6b47] text-xs">The genetic testing industry hub.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
