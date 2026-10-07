const fs = require('fs');
let code = fs.readFileSync('src/app/profile/edit/page.tsx', 'utf8');

const payloadOld = `      const payload = {
        name,
        email,
        username,
        image,
        bio,
        role,
        skills,
        headline,
        address_detail: addressDetail,
        banner_image: bannerImage,
        education,
        ...(role === "mentor"
          ? {
              instagramId,
              phone,
              linkedin,
              github,
              website,
            }
          : {
              instagramId,
            }),
      };`;

const payloadNew = `      const payload = {
        name,
        email,
        username,
        image,
        bio,
        role,
        skills,
        ...(role === "mentor"
          ? {
              instagramId,
            }
          : {
              instagramId,
            }),
      };`;

code = code.replace(payloadOld, payloadNew);

// Just hide the whole extra fields block if it's there
code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4">/g, '<div className="hidden">');

// Also hide Education
code = code.replace(/\{\/\* Education \*\/\}/g, '<div className="hidden">');
code = code.replace(/\{\/\* Skills \*\/\}/g, '</div>{/* Skills */}');

// Also hide Banner Image
code = code.replace(/\{\/\* Banner Image \*\/\}/g, '<div className="hidden">');
code = code.replace(/\{\/\* Profile Picture \*\/\}/g, '</div>{/* Profile Picture */}');

// Hide headline and addressDetail
code = code.replace(/<label htmlFor="headline"/g, '<label className="hidden" htmlFor="headline"');
code = code.replace(/<label htmlFor="addressDetail"/g, '<label className="hidden" htmlFor="addressDetail"');
code = code.replace(/<input\s*id="headline"/g, '<input className="hidden" id="headline"');
code = code.replace(/<textarea\s*id="addressDetail"/g, '<textarea className="hidden" id="addressDetail"');

fs.writeFileSync('src/app/profile/edit/page.tsx', code);
console.log('done');
