const fs = require('fs');
let code = fs.readFileSync('src/app/profile/edit/page.tsx', 'utf8');

// 1. Add states
const regexStates = /const \[instagramId, setInstagramId\] = useState<string \| null>\(null\);/;
const matchStates = code.match(regexStates);
if (matchStates) {
  code = code.replace(
    regexStates,
    `const [instagramId, setInstagramId] = useState<string | null>(null);\n  const [phone, setPhone] = useState("");\n  const [linkedin, setLinkedin] = useState("");\n  const [github, setGithub] = useState("");\n  const [website, setWebsite] = useState("");`
  );
}

// 2. Add to getUserProfile
const regexProfile = /setInstagramId\(data\.instagramId \|\| null\);/;
if (code.match(regexProfile)) {
  code = code.replace(
    regexProfile,
    `setInstagramId(data.instagramId || null);\n          setPhone(data.phone || "");\n          setLinkedin(data.linkedin || "");\n          setGithub(data.github || "");\n          setWebsite(data.website || "");`
  );
}

// 3. Add to handleSave payload
const regexSave = /skills,\n\s*};/;
if (code.match(regexSave)) {
  code = code.replace(
    regexSave,
    `skills,\n        phone,\n        linkedin,\n        github,\n        website,\n      };`
  );
}

fs.writeFileSync('src/app/profile/edit/page.tsx', code);
console.log('done');
