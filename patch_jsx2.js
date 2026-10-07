const fs = require('fs');
let code = fs.readFileSync('src/app/profile/edit/page.tsx', 'utf8');

const anchor = '          <div>\n            <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">\n              Instagram\n            </label>';

const newStr = `          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
              Nomor HP (WhatsApp)
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSaving}
              placeholder="Contoh: 081234567890"
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="linkedin" className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
              LinkedIn Profile
            </label>
            <input
              id="linkedin"
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              disabled={isSaving}
              placeholder="Contoh: linkedin.com/in/username"
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="github" className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
              GitHub Profile
            </label>
            <input
              id="github"
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              disabled={isSaving}
              placeholder="Contoh: github.com/username"
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
              Website / Portfolio URL
            </label>
            <input
              id="website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={isSaving}
              placeholder="Contoh: username.com"
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
            />
          </div>\n\n` + anchor;

if (code.includes(anchor)) {
  code = code.replace(anchor, newStr);
  fs.writeFileSync('src/app/profile/edit/page.tsx', code);
  console.log("done");
} else {
  console.log("Anchor not found");
}
