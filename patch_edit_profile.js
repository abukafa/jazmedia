const fs = require('fs');
let code = fs.readFileSync('src/app/profile/edit/page.tsx', 'utf8');

// 1. Add states
const statesBlock = `  const [skills, setSkills] = useState<Skill[]>([]);
  const [instagramId, setInstagramId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(true);`;

code = code.replace(
  '  const [skills, setSkills] = useState<Skill[]>([]);\n  const [instagramId, setInstagramId] = useState<string | null>(null);\n  const [isLoading, setIsLoading] = useState(true);',
  statesBlock
);

// 2. Add to getUserProfile
const getBlockOld = `          setInstagramId(data.instagramId || null);`;
const getBlockNew = `          setInstagramId(data.instagramId || null);
          setPhone(data.phone || "");
          setLinkedin(data.linkedin || "");
          setGithub(data.github || "");
          setWebsite(data.website || "");`;
code = code.replace(getBlockOld, getBlockNew);

// 3. Add to handleSave payload
const payloadBlockOld = `        bio,
        role,
        skills,
      };`;
const payloadBlockNew = `        bio,
        role,
        skills,
        phone,
        linkedin,
        github,
        website,
      };`;
code = code.replace(payloadBlockOld, payloadBlockNew);

// 4. Update JSX form
const jsxBlockOld = `            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Nama Lengkap</Label>`;
const jsxBlockNew = `            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Nama Lengkap</Label>`;

// Wait, I need to find the right place in JSX to put the contact/social fields.
// Usually after Address. Let's see what exists after address.
