const fs = require('fs');
let code = fs.readFileSync('src/app/profile/edit/page.tsx', 'utf8');

// 1. Remove Headline
code = code.replace(/<div>\s*<label htmlFor="headline"[\s\S]*?<\/div>\s*<\/div>/g, '');

// 2. Remove Address Detail
code = code.replace(/<div>\s*<label htmlFor="addressDetail"[\s\S]*?<\/div>/g, '');

// 3. Remove Banner Image
code = code.replace(/\{\/\*\s*Banner Image\s*\*\/\}[\s\S]*?(?=\{\/\*\s*Profile Picture)/g, '');

// 4. Remove Education
code = code.replace(/\{\/\*\s*Education\s*\*\/\}[\s\S]*?(?=\{\/\*\s*Skills)/g, '');

// 5. Remove Phone and Socials block before Instagram
code = code.replace(/<div>\s*<label htmlFor="phone"[\s\S]*?(?=\{\/\*\s*Instagram)/g, '');

// 6. Remove states
code = code.replace(/const \[addressDetail, setAddressDetail\] = useState\(""\);\n/g, '');
code = code.replace(/const \[bannerImage, setBannerImage\] = useState\(""\);\n/g, '');
code = code.replace(/const \[education, setEducation\] = useState<Education\[\]>\(\[\]\);\n/g, '');
code = code.replace(/const \[headline, setHeadline\] = useState\(""\);\n/g, '');

// 7. Remove variables from useEffect
code = code.replace(/setAddressDetail\(.*?\);\n/g, '');
code = code.replace(/setBannerImage\(.*?\);\n/g, '');
code = code.replace(/let loadedEdu[\s\S]*?setEducation\(loadedEdu\);\n/g, '');
code = code.replace(/setHeadline\(.*?\);\n/g, '');

fs.writeFileSync('src/app/profile/edit/page.tsx', code);
console.log('done');
