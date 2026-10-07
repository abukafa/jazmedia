const fs = require('fs');
let code = fs.readFileSync('src/components/profile/PortfolioView.tsx', 'utf8');

const anchor = `function getDirectMediaUrl(url: string, type: "image" | "video") {
    if (!url) return "";
    if (url.includes("google.com") || url.includes("drive.google.com")) {
      return \`/api/proxy/media?url=\${encodeURIComponent(url)}&type=\${type}\`;
    }
    return url;
  }`;

if (code.includes(anchor)) {
  code = code.replace(anchor, '');
  
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
  console.log("Not found");
}
