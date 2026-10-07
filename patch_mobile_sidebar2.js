const fs = require('fs');
let code = fs.readFileSync('src/components/profile/PortfolioView.tsx', 'utf8');

// Remove from bottom
const regexBottom = /<div className="block lg:hidden mt-6 mb-24 space-y-4">\s*\{rightSidebarContent\}\s*<\/div>\s*/;
if (code.match(regexBottom)) {
  code = code.replace(regexBottom, '');
}

// Insert before grid
const targetGrid = `<h3 className="font-bold text-slate-900 mb-4 text-base">\n            Featured Portofolio & Tugas\n          </h3>`;
const newGrid = `<div className="block lg:hidden space-y-4 mb-6">\n            {rightSidebarContent}\n          </div>\n\n          ${targetGrid}`;

if (code.includes(targetGrid)) {
  code = code.replace(targetGrid, newGrid);
  fs.writeFileSync('src/components/profile/PortfolioView.tsx', code);
  console.log("done");
} else {
  console.log("Grid target not found");
}
