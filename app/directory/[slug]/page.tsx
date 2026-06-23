import { getFileBySlug, getAllFiles, getFiles } from "@/lib/content";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateStaticParams() {
  return getFiles("companies").map((f) => ({ slug: f.replace(".md", "") }));
}

const AVATAR_COLORS = [
  ["#d4f0e2","#0d4a2a"],["#d4ede0","#0a3d22"],["#d0f0e8","#0a4a35"],
  ["#e0f5e8","#0d5c32"],["#c8ebd8","#0f3d24"],["#fef3d0","#a06b00"],
];
function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

const CATEGORY_ICONS: Record<string, string> = {
  "Consumer DNA Testing": "🧬",
  "Clinical Diagnostics": "🏥",
  "Oncology Genomics": "🔬",
  "Pharmacogenomics": "💊",
  "Prenatal Testing": "👶",
  "Ancestry & Genealogy": "🌳",
  "Research Tools": "🔭",
  "Genetic Counseling": "🩺",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = getFileBySlug("companies", slug) as any;
  if (!company) return {};
  return {
    title: `${company.name} — GeneticTesting.com`,
    description: company.description,
  };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = getFileBySlug("companies", slug) as any;
  if (!company) notFound();

  const allCompanies = getAllFiles("companies") as any[];
  const related = allCompanies.filter((c) => c.category === company.category && c.slug !== slug).slice(0, 6);
  const allNews = getAllFiles("news") as any[];

  const [bg, fg] = avatarColor(company.name);
  const icon = CATEGORY_ICONS[company.category] || "🧬";

  const paragraphs = (company.content || "").split(/\n\n+/).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header band */}
      <div className="bg-[#0a2818] px-5 py-10">
        <div className="max-w-5xl mx-auto">
          <Link href="/directory" className="text-[#2db87d] text-xs hover:text-white transition-colors mb-6 inline-flex items-center gap-1.5">
            ← Back to directory
          </Link>
          <div className="flex items-start gap-5 mt-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 shadow-lg"
              style={{ background: bg, color: fg }}>
              {initials(company.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{company.name}</h1>
                {company.featured && (
                  <span className="text-xs bg-[#0d4a2a] text-[#2db87d] border border-[#2db87d]/30 px-3 py-1 rounded-full font-semibold">Featured</span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-[#86d4a8]">{icon} {company.category}</span>
                {company.location && <span className="text-[#2a6b47] text-sm">· 📍 {company.location}</span>}
              </div>
            </div>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="shrink-0 bg-[#0d4a2a] hover:bg-[#0f5c32] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Visit website →
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-10 grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-7">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Overview</h2>
            <p className="text-gray-700 text-base leading-relaxed font-medium mb-5">{company.description}</p>
            {paragraphs.length > 0 && (
              <div className="space-y-4 border-t border-gray-50 pt-5">
                {paragraphs.map((p: string, i: number) => (
                  <p key={i} className="text-gray-600 text-sm leading-relaxed">{p}</p>
                ))}
              </div>
            )}
          </div>

          {/* Related companies */}
          {related.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-7">
              <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-5">
                More in {company.category}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {related.map((c: any) => {
                  const [rbg, rfg] = avatarColor(c.name);
                  return (
                    <Link key={c.slug} href={`/directory/${c.slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#0d4a2a]/20 hover:bg-[#edfaf3] transition-all">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: rbg, color: rfg }}>
                        {initials(c.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                        <p className="text-xs text-gray-400 truncate">{c.location}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent industry news */}
          {allNews.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-7">
              <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-5">Latest industry news</h2>
              <div className="flex flex-col divide-y divide-gray-50">
                {allNews.slice(0, 4).map((n: any) => (
                  <Link key={n.slug} href={`/news/${n.slug}`}
                    className="py-3.5 first:pt-0 hover:text-[#0d4a2a] group">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#0d4a2a] transition-colors leading-snug">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.date} · {n.category}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Company details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Company details</h2>
            <div className="space-y-3">
              {[
                { label: "Category", value: `${icon} ${company.category}` },
                { label: "Location", value: company.location },
                { label: "Funding", value: company.funding && company.funding !== "Unknown" ? company.funding : null },
                { label: "Website", value: company.website, isLink: true },
                { label: "Listed", value: company.date },
              ].filter(f => f.value).map(({ label, value, isLink }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                  {isLink ? (
                    <a href={value as string} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-[#0d4a2a] hover:underline truncate font-medium">
                      {(value as string).replace(/https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-700 font-medium">{value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Claim listing */}
          <div className="bg-[#edfaf3] border border-[#0d4a2a]/15 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 text-sm mb-1.5">Is this your company?</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">Claim this listing to add your logo, full description, and products. Premium listings get featured placement.</p>
            <a href="/advertise" className="block text-center bg-[#0d4a2a] hover:bg-[#082d19] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors">
              Claim & upgrade listing
            </a>
          </div>

          {/* Advertise */}
          <div className="bg-[#0a2818] rounded-2xl p-6">
            <p className="text-[#2db87d] text-[10px] font-bold tracking-widest uppercase mb-2">Advertise</p>
            <h3 className="text-white font-bold text-sm mb-1.5">Reach genomics professionals</h3>
            <p className="text-[#86d4a8] text-xs leading-relaxed mb-4">Newsletter sponsorships, featured listings, and sponsored articles.</p>
            <a href="/advertise" className="block text-center border border-[#0d4a2a] text-[#86d4a8] hover:bg-[#0d4a2a] text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
              View packages →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
