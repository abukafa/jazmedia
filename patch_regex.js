const fs = require('fs');
let code = fs.readFileSync('src/components/profile/PortfolioView.tsx', 'utf8');

const regexAvatar = /<Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-md bg-white">[\s\S]*?<\/Avatar>/;
const matchAvatar = code.match(regexAvatar);

if (matchAvatar) {
  code = code.replace(regexAvatar, `<div className="relative inline-block">\n                  ${matchAvatar[0]}\n                  <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-rose-500 text-white rounded-full p-0.5 sm:p-1 border-2 border-white shadow-sm flex items-center justify-center">\n                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 sm:w-4 sm:h-4"><polyline points="20 6 9 17 4 12"></polyline></svg>\n                  </div>\n                </div>`);
}

const regexName = /<h2 className="text-2xl font-black text-slate-900 leading-tight">[\s\S]*?<\/h2>\s*<CheckCircle2 className="w-5 h-5 text-blue-500" \/>[\s\S]*?<\/span>\n                  \)\}/;
const matchName = code.match(regexName);

if (matchName) {
  code = code.replace(regexName, `<h2 className="text-2xl font-black text-slate-900 leading-tight">\n                    {profile.name}\n                  </h2>\n                  {profile.role && profile.role !== "admin" && (\n                    <span className={\`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider \${profile.role === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}\`}>\n                      {profile.role === 'student' ? 'Student' : 'Mentor'}\n                    </span>\n                  )}`);
}

const regexIg = /href=\{\`https:\/\/instagram\.com\/\$\{profile\.instagramId\.replace\('@', ''\)\}\`\}/;
const matchIg = code.match(regexIg);

if (matchIg) {
  code = code.replace(regexIg, `href={\`https://instagram.com/\${profile.instagramId.match(/^[0-9]+$/) ? (profile.username || profile.name.replace(/\\s/g, "").toLowerCase()) : profile.instagramId.replace('@', '')}\`}`);
}

const regexAbout = /\{\/\*\s*About Card\s*\*\/\}[\s\S]*?\{\s*profile\.bio && \(\s*<div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">[\s\S]*?<\/div>\s*\)\s*\}/;
const matchAbout = code.match(regexAbout);

if (matchAbout) {
  code = code.replace(regexAbout, `{/* About Section */}\n          {profile.bio && (\n            <>\n              <hr className="border-slate-100 mt-6 mb-6" />\n              <div className="px-2 pb-6">\n                <h3 className="font-bold text-slate-900 mb-3 text-lg">Tentang Saya</h3>\n                <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap">\n                  {profile.bio}\n                </p>\n              </div>\n            </>\n          )}`);
}

fs.writeFileSync('src/components/profile/PortfolioView.tsx', code);
console.log('done');
