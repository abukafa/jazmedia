const fs = require('fs');
let code = fs.readFileSync('src/components/profile/PortfolioView.tsx', 'utf8');

const targetStart = code.indexOf('<div className="flex-1">');
const targetEnd = code.indexOf('</div>\n            </div>\n\n          </div>', targetStart);

if (targetStart === -1 || targetEnd === -1) {
  console.log("Not found.");
  process.exit(1);
}

const replacement = `<div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">
                      {profile.name}
                    </h2>
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    {profile.role && profile.role !== "admin" && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
                        {profile.role === 'mentor' ? 'Mentor' : 'Student'}
                      </span>
                    )}
                  </div>
                  
                  {profile.headline && (
                    <p className="text-[15px] font-bold text-slate-700 mt-1 mb-2 leading-snug">{profile.headline}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 mb-3 mt-3">
                    <span className="text-blue-600 font-bold hover:underline cursor-pointer">
                      @{profile.username || profile.name.replace(/\\s/g, "").toLowerCase()}
                    </span>
                    {profile.address_detail && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-slate-400" /> {profile.address_detail}
                      </span>
                    )}
                    {profile.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4 text-slate-400" /> 
                        <a href={\`mailto:\${profile.email}\`} className="hover:text-blue-600 transition-colors">{profile.email}</a>
                      </span>
                    )}
                    {profile.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-slate-400" /> 
                        <a href={\`tel:\${profile.phone}\`} className="hover:text-blue-600 transition-colors">{profile.phone}</a>
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {profile.instagramId && (
                      <a href={\`https://instagram.com/\${profile.instagramId.replace('@', '')}\`} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {profile.linkedin && (
                      <a href={profile.linkedin.startsWith('http') ? profile.linkedin : \`https://\${profile.linkedin}\`} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {profile.github && (
                      <a href={profile.github.startsWith('http') ? profile.github : \`https://\${profile.github}\`} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {profile.website && (
                      <a href={profile.website.startsWith('http') ? profile.website : \`https://\${profile.website}\`} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors">
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                `;

code = code.substring(0, targetStart) + replacement + code.substring(targetEnd);

fs.writeFileSync('src/components/profile/PortfolioView.tsx', code);
console.log("done");
