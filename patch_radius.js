const fs = require('fs');
let code = fs.readFileSync('src/components/profile/PortfolioView.tsx', 'utf8');

const regex = /<div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">/g;
const replacement = '<div className="bg-white md:rounded-3xl p-5 border border-slate-100 shadow-sm">';

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/profile/PortfolioView.tsx', code);
console.log('done');
