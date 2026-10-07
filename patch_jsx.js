const fs = require('fs');
let code = fs.readFileSync('src/app/profile/edit/page.tsx', 'utf8');

// Find start of Headline
let hStart = code.indexOf('<label htmlFor="headline"');
if (hStart !== -1) {
  let start = code.lastIndexOf('<div', hStart);
  let end = code.indexOf('</div>', hStart);
  end = code.indexOf('</div>', end + 1) + 6;
  code = code.substring(0, start) + code.substring(end);
}

// Find start of Address Detail
let aStart = code.indexOf('<label htmlFor="addressDetail"');
if (aStart !== -1) {
  let start = code.lastIndexOf('<div', aStart);
  let end = code.indexOf('</div>', aStart);
  end = code.indexOf('</div>', end + 1) + 6;
  code = code.substring(0, start) + code.substring(end);
}

// Find start of Phone
let pStart = code.indexOf('<label htmlFor="phone"');
if (pStart !== -1) {
  let start = code.lastIndexOf('<div', pStart);
  let end = code.indexOf('{/* Instagram */}', start);
  code = code.substring(0, start) + code.substring(end);
}

// Find start of Banner Image
let bStart = code.indexOf('{/* Banner Image */}');
if (bStart !== -1) {
  let start = bStart;
  let end = code.indexOf('{/* Profile Picture */}', start);
  code = code.substring(0, start) + code.substring(end);
}

// Find start of Education
let eStart = code.indexOf('{/* Education */}');
if (eStart !== -1) {
  let start = eStart;
  let end = code.indexOf('{/* Skills */}', start);
  code = code.substring(0, start) + code.substring(end);
}

fs.writeFileSync('src/app/profile/edit/page.tsx', code);
console.log('done');
