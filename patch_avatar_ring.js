const fs = require('fs');
let code = fs.readFileSync('src/components/profile/PortfolioView.tsx', 'utf8');

// 1. Avatar modification
const avatarRegex = /<div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-rose-500 text-white rounded-full p-0.5 sm:p-1 border-2 border-white shadow-sm flex items-center justify-center">[\s\S]*?<\/div>/;

const avatarNew = `<div className={\`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-white ring-[6px] ring-offset-2 ring-offset-white shadow-sm \${profile.role === 'student' ? 'bg-blue-500 ring-blue-50' : 'bg-rose-500 ring-rose-50'}\`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 sm:w-4 sm:h-4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>`;

if (code.match(avatarRegex)) {
  code = code.replace(avatarRegex, avatarNew);
} else {
  console.log("Avatar regex not found");
}

// 2. About section padding modification
const aboutRegex = /<div className="px-2">\s*<h3 className="font-bold text-slate-900 mb-3 text-lg">Tentang Saya<\/h3>/;
const aboutNew = `<div className="px-6 py-6">\n                <h3 className="font-bold text-slate-900 mb-3 text-lg">Tentang Saya</h3>`;

if (code.match(aboutRegex)) {
  code = code.replace(aboutRegex, aboutNew);
} else {
  console.log("About regex not found");
}

fs.writeFileSync('src/components/profile/PortfolioView.tsx', code);
console.log("done");
