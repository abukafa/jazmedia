const fs = require('fs');
let code = fs.readFileSync('src/app/profile/edit/page.tsx', 'utf8');

code = code.replace(/const \[phone, setPhone\] = useState\(""\);\n\s*const \[linkedin, setLinkedin\] = useState\(""\);\n\s*const \[github, setGithub\] = useState\(""\);\n\s*const \[website, setWebsite\] = useState\(""\);/g, '');
code = code.replace(/setPhone\(data\.phone \|\| ""\);\n\s*setLinkedin\(data\.linkedin \|\| ""\);\n\s*setGithub\(data\.github \|\| ""\);\n\s*setWebsite\(data\.website \|\| ""\);/g, '');
code = code.replace(/address_detail: addressDetail,\n\s*banner_image: bannerImage,\n\s*education,\n\s*phone,\n\s*linkedin,\n\s*github,\n\s*website,/g, '');

const regexInputs = /<div(?!>)[^>]*?>\s*<label htmlFor="phone"[\s\S]*?<label htmlFor="linkedin"[\s\S]*?<label htmlFor="github"[\s\S]*?<label htmlFor="website"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
// Wait, regex might be brittle for JSX. Let's just use replace with indexOf or similar.
const startIdx = code.indexOf('<label htmlFor="phone"');
if (startIdx !== -1) {
  // Find the div containing it
  const divStart = code.lastIndexOf('<div', startIdx);
  const endIdx = code.indexOf('{/* Instagram */}', startIdx);
  if (divStart !== -1 && endIdx !== -1) {
    code = code.substring(0, divStart) + code.substring(endIdx);
  }
}

fs.writeFileSync('src/app/profile/edit/page.tsx', code);
console.log('done');
