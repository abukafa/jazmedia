const fs = require('fs');
let code = fs.readFileSync('src/app/profile/edit/page.tsx', 'utf8');

const regex = /education,\n\s*\};/;
const match = code.match(regex);
if (match) {
    code = code.replace(regex, `education,\n        phone,\n        linkedin,\n        github,\n        website,\n      };`);
    fs.writeFileSync('src/app/profile/edit/page.tsx', code);
    console.log('done');
} else {
    console.log('Regex not found');
}
