import sys
import re

with open('src/components/profile/PortfolioView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update Cover Photo
code = code.replace(
    '''            {/* Cover Photo Area */}
            <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
               {/* Decorative abstract shapes */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-16 blur-2xl" />
               <div className="absolute bottom-0 left-10 w-40 h-40 bg-black/10 rounded-full translate-y-20 blur-xl" />
            </div>''',
    '''            {/* Cover Photo Area */}
            <div className="h-32 sm:h-48 relative overflow-hidden bg-slate-200">
              {profile.banner_image ? (
                <img src={profile.banner_image} className="w-full h-full object-cover" alt="Banner" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-16 blur-2xl" />
                  <div className="absolute bottom-0 left-10 w-40 h-40 bg-black/10 rounded-full translate-y-20 blur-xl" />
                </div>
              )}
            </div>'''
)

# 2. Add Headline
code = code.replace(
    '''                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {profile.name}
                  </h2>
                  <p className="text-slate-600 mt-1 mb-3">''',
    '''                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {profile.name}
                  </h2>
                  {profile.headline && (
                    <p className="text-[15px] font-bold text-slate-700 mt-1 mb-2 leading-snug">{profile.headline}</p>
                  )}
                  <p className="text-slate-600 mt-1 mb-3">'''
)

# 3. Update Location
code = code.replace(
    '''                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> Indonesia
                    </span>''',
    '''                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {profile.address_detail || "Indonesia"}
                    </span>'''
)


# 4. Add Education and Recommendations
education_jsx = '''
        {/* Pendidikan (Education) */}
        {profile.education && profile.education.length > 0 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">Pendidikan</h3>
            <div className="relative border-l-2 border-slate-100 ml-3 space-y-4 pb-2">
              {profile.education.map((edu: any, idx: number) => (
                <div key={idx} className="relative pl-5">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white border-4 border-slate-300 rounded-full" />
                  <h4 className="text-sm font-bold leading-tight text-slate-900">{edu.school}</h4>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">{edu.major} {edu.degree && `• ${edu.degree}`}</div>
                  <div className="text-[11px] text-slate-400 font-bold mt-1">{edu.year}</div>
                </div>
              ))}
            </div>
          </div>
        )}
'''

recommendations_jsx = '''
          {/* Recommendations Section */}
          {profile.recommendations && profile.recommendations.length > 0 && (
            <div className="bg-white md:rounded-3xl border-y md:border-x border-slate-100 p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Rekomendasi
              </h3>
              <div className="space-y-4">
                {profile.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                    <p className="text-sm text-slate-700 italic leading-relaxed mb-3">"{rec.text}"</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-[10px] uppercase">
                          {rec.author_name ? rec.author_name.substring(0,2) : "??"}
                        </div>
                        <span className="text-xs font-bold text-slate-900">{rec.author_name || "Member"}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{rec.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
'''

code = code.replace(
    '        {/* Proyek (Experience) - Interactive Timeline */}',
    education_jsx + '\n        {/* Proyek (Experience) - Interactive Timeline */}'
)

code = code.replace(
    '        {/* Feed Tab (Public Tasks) */}',
    recommendations_jsx + '\n        {/* Feed Tab (Public Tasks) */}'
)

# Import Award if not imported
if 'Award' not in code:
    code = code.replace(
        '  Briefcase,\n  MapPin\n} from "lucide-react";',
        '  Briefcase,\n  MapPin,\n  Award\n} from "lucide-react";'
    )


with open('src/components/profile/PortfolioView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Portfolio patched!")
