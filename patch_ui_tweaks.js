const fs = require('fs');
let code = fs.readFileSync('src/components/profile/PortfolioView.tsx', 'utf8');

// 1. Avatar modification
const avatarOld = `<Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-md bg-white">
                  <AvatarImage src={profile.image || \`/no-photo.png\`} />
                  <AvatarFallback className="text-2xl">{profile.name?.substring(0, 2)}</AvatarFallback>
                </Avatar>`;
const avatarNew = `<div className="relative inline-block">
                  <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-md bg-white">
                    <AvatarImage src={profile.image || \`/no-photo.png\`} />
                    <AvatarFallback className="text-2xl">{profile.name?.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-rose-500 text-white rounded-full p-0.5 sm:p-1 border-2 border-white shadow-sm flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 sm:w-4 sm:h-4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>`;
code = code.replace(avatarOld, avatarNew);

// 2. Name & Badge modification
const nameOld = `<h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {profile.name}
                  </h2>
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  {profile.role && profile.role !== "admin" && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
                      {profile.role === 'mentor' ? 'Mentor' : 'Student'}
                    </span>
                  )}`;
const nameNew = `<h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {profile.name}
                  </h2>
                  {profile.role && (
                    <span className={\`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider \${
                      profile.role === 'student' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-rose-100 text-rose-700'
                    }\`}>
                      {profile.role === 'student' ? 'Student' : 'Mentor'}
                    </span>
                  )}`;
code = code.replace(nameOld, nameNew);

// 3. Instagram href modification
const igOld = `href={\`https://instagram.com/\${profile.instagramId.replace('@', '')}\`}`;
const igNew = `href={\`https://instagram.com/\${
                      profile.instagramId.match(/^[0-9]+$/)
                        ? (profile.username || profile.name.replace(/\\s/g, "").toLowerCase())
                        : profile.instagramId.replace('@', '')
                    }\`}`;
code = code.replace(igOld, igNew);

// 4. Hide border for about section
const aboutOld = `{/* About Card */}
          {profile.bio && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3 text-lg">Tentang Saya</h3>
              <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          )}`;
const aboutNew = `{/* About Section */}
          {profile.bio && (
            <>
              <hr className="border-slate-100" />
              <div className="px-2">
                <h3 className="font-bold text-slate-900 mb-3 text-lg">Tentang Saya</h3>
                <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            </>
          )}`;
code = code.replace(aboutOld, aboutNew);

fs.writeFileSync('src/components/profile/PortfolioView.tsx', code);
console.log('done');
