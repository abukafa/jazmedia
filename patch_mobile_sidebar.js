const fs = require('fs');
let code = fs.readFileSync('src/components/profile/PortfolioView.tsx', 'utf8');

const regex = /\{\/\* Detail Post Overlay \*\/\}/;
const replacement = `<div className="block lg:hidden mt-6 mb-24 space-y-4">\n        {rightSidebarContent}\n      </div>\n\n      {/* Detail Post Overlay */}`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/components/profile/PortfolioView.tsx', code);
  console.log("done");
} else {
  console.log("Not found");
}
