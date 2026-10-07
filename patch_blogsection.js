const fs = require('fs');
let code = fs.readFileSync('src/components/home/BlogsSection.tsx', 'utf8');

// Replace all instances of 'blog.id || blog._id' with '(blog.id || blog._id || "")'
code = code.replace(/blog\.id\s*\|\|\s*blog\._id/g, '(blog.id || blog._id || "")');

fs.writeFileSync('src/components/home/BlogsSection.tsx', code);
console.log('done');
