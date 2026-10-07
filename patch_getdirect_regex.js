const fs = require('fs');
let code = fs.readFileSync('src/components/profile/PortfolioView.tsx', 'utf8');

const regex = /function getDirectMediaUrl[\s\S]*?return url;\n\s*\}/;

if (code.match(regex)) {
  code = code.replace(regex, '');
  
  // Add import if not present
  if (!code.includes('import { getDirectMediaUrl }')) {
    code = code.replace(
      'import { TaskCard } from "@/components/feed/TaskCard";',
      'import { TaskCard } from "@/components/feed/TaskCard";\nimport { getDirectMediaUrl } from "@/lib/utils/media";'
    );
  }
  
  fs.writeFileSync('src/components/profile/PortfolioView.tsx', code);
  console.log("done");
} else {
  console.log("Not found regex");
}
