const fs = require('fs');
let code = fs.readFileSync('src/components/profile/PortfolioView.tsx', 'utf8');

// Reverse the damage
code = code.replace(/}\r?\n      <\/div>\r?\n    <\/div>\r?\n  \);\r?\n\r?\n  return \(/g, '}\n  return (');

// Now explicitly insert the closing tags for rightSidebarContent ONLY at the correct place.
code = code.replace(
  /Belum tergabung di proyek\.<\/p>\r?\n        \)}\r?\n  return \(\r?\n    <FeedLayout/g,
  'Belum tergabung di proyek.</p>\n        )}\n      </div>\n    </div>\n  );\n\n  return (\n    <FeedLayout'
);

fs.writeFileSync('src/components/profile/PortfolioView.tsx', code);
console.log('done');
