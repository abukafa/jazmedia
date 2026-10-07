const fs = require('fs');
let code = fs.readFileSync('src/app/profile/edit/page.tsx', 'utf8');

// Find start of Address Detail
let idx1 = code.indexOf('<label htmlFor="addressDetail"');
if (idx1 !== -1) {
  let divStart = code.lastIndexOf('<div', idx1);
  let divEnd = code.indexOf('{/* Instagram */}', idx1); // Until Instagram
  if (divStart !== -1 && divEnd !== -1) {
    code = code.substring(0, divStart) + code.substring(divEnd);
  }
}

// Find start of Headline
let idx2 = code.indexOf('<label htmlFor="headline"');
if (idx2 !== -1) {
  let divStart = code.lastIndexOf('<div', idx2);
  let divEnd = code.indexOf('</div>', divStart) + 6;
  code = code.substring(0, divStart) + code.substring(divEnd);
}

// Find start of Banner Image
let idx3 = code.indexOf('{/* Banner Image */}');
if (idx3 !== -1) {
  let divEnd = code.indexOf('</div>', idx3) + 6;
  divEnd = code.indexOf('</div>', divEnd) + 6; // it has nested divs probably
  // Let's just use string replacement for banner
}

// Just to be safe, I'll delete the education section
let idx4 = code.indexOf('{/* Education */}');
if (idx4 !== -1) {
  let endIdx = code.indexOf('{/* Skills */}', idx4);
  if (endIdx !== -1) {
    code = code.substring(0, idx4) + code.substring(endIdx);
  }
}

fs.writeFileSync('src/app/profile/edit/page.tsx', code);
console.log('done');
