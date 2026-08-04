import { 
  Building2, 
} from "lucide-react"
import { auth } from "@/lib/auth"
import { getTentangPageContent } from "@/app/actions/cms"
import { CmsTentangEditorSheet } from "@/components/cms/cms-tentang-editor-sheet"
import { TentangHighlightsEditor } from "@/components/cms/tentang-highlights-editor"
import { TentangTeamEditor } from "@/components/cms/tentang-team-editor"

export default async function TentangPage() {
  const session = await auth()
  const isAdmin = session?.user?.role === "ADMIN"
  const cmsData = await getTentangPageContent()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 w-full">
        {/* HERO SECTION - Foto Pabrik */}
        <section className="relative h-[400px] md:h-[500px] bg-blue-950 flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${cmsData.hero.backgroundImageUrl}')` }}
          ></div>
          
          {/* Overlay gradient for modern look */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-900/40 mix-blend-multiply z-10"></div>
          {/* Additional subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/50 to-transparent z-10"></div>
          
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/50 text-red-200 text-xs font-bold uppercase tracking-widest mb-6">
              <Building2 className="w-4 h-4" /> {cmsData.hero.badgeText}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
              {cmsData.hero.title}
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed whitespace-pre-wrap">
              {cmsData.hero.subtitle}
            </p>
          </div>
        </section>

        {/* SEJARAH PERUSAHAAN */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-sm font-extrabold text-red-600 uppercase tracking-widest mb-3">{cmsData.about.label}</h2>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                  {cmsData.about.title}
                </h3>
                <div className="space-y-4 text-slate-600 leading-relaxed">
                  <p>{cmsData.about.paragraph1}</p>
                  <p>{cmsData.about.paragraph2}</p>
                  <p>{cmsData.about.paragraph3}</p>
                </div>
                
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm">
                        C{i}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Dipercaya oleh <span className="text-blue-950 font-extrabold">500+</span> Perusahaan</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-200 bg-slate-100 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-5"></div>
                  <Building2 className="w-24 h-24 text-slate-300" />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{cmsData.about.statsLabel}</p>
                    <p className="text-xl font-extrabold text-blue-950">{cmsData.about.statsValue} <span className="text-sm font-medium text-slate-600">{cmsData.about.statsSubtext}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 HIGHLIGHT CARDS (Visi Misi, Sertifikasi, Kapasitas) */}
        <TentangHighlightsEditor cmsData={cmsData} isAdmin={isAdmin} />

        {/* TIM / STRUKTUR MANAJEMEN */}
        <TentangTeamEditor cmsData={cmsData} isAdmin={isAdmin} />

      </main>

      {isAdmin && <CmsTentangEditorSheet initialData={cmsData} />}
    </div>
  )
}
