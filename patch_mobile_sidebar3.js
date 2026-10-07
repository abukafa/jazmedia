const fs = require('fs');
let code = fs.readFileSync('src/components/profile/PortfolioView.tsx', 'utf8');

// Remove from inside the card
const regexInside = /<div className="block lg:hidden space-y-4 mb-6">\s*\{rightSidebarContent\}\s*<\/div>\s*/;
if (code.match(regexInside)) {
  code = code.replace(regexInside, '');
}

// Insert before the Portofolio & Activity card
const targetCard = '{/* Portofolio & Activity (Tasks Grid) */}';
const newCard = `<div className="block lg:hidden space-y-4">\n            {rightSidebarContent}\n          </div>\n\n          ${targetCard}`;

if (code.includes(targetCard)) {
  code = code.replace(targetCard, newCard);
  fs.writeFileSync('src/components/profile/PortfolioView.tsx', code);
  console.log("done");
} else {
  console.log("Card target not found");
}
