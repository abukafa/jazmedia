const fs = require('fs');
let code = fs.readFileSync('src/app/profile/edit/page.tsx', 'utf8');

const regexes = [
  /^\s*const \[addressDetail, setAddressDetail\] = useState\(""\);\r?\n/gm,
  /^\s*const \[bannerImage, setBannerImage\] = useState\(""\);\r?\n/gm,
  /^\s*const \[education, setEducation\] = useState<Education\[\]>\(\[\]\);\r?\n/gm,
  /^\s*const \[headline, setHeadline\] = useState\(""\);\r?\n/gm,
  /^\s*setHeadline\(data\.headline \|\| ""\);\r?\n/gm,
  /^\s*setAddressDetail\(data\.address_detail \|\| ""\);\r?\n/gm,
  /^\s*setBannerImage\(data\.banner_image \|\| ""\);\r?\n/gm,
  /^\s*let loadedEdu: Education\[\] = \[\];\r?\n/gm,
  /^\s*if \(Array\.isArray\(data\.education\)\) \{\r?\n/gm,
  /^\s*loadedEdu = data\.education;\r?\n/gm,
  /^\s*\} else if \(typeof data\.education === "string"\) \{\r?\n/gm,
  /^\s*try \{ loadedEdu = JSON\.parse\(data\.education\); \} catch \{\}\r?\n/gm,
  /^\s*\}\r?\n/gm,
  /^\s*setEducation\(loadedEdu\);\r?\n/gm
];

regexes.forEach(regex => {
  code = code.replace(regex, '');
});

fs.writeFileSync('src/app/profile/edit/page.tsx', code);
console.log('done');
