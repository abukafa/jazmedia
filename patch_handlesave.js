const fs = require('fs');
let code = fs.readFileSync('src/app/profile/edit/page.tsx', 'utf8');

const anchor = `      const payload = {
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
      };`;

const newStr = `      const payload = {
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
        phone,
        linkedin,
        github,
        website,
      };`;

if (code.includes(anchor)) {
    code = code.replace(anchor, newStr);
    fs.writeFileSync('src/app/profile/edit/page.tsx', code);
    console.log('done');
} else {
    console.log('Anchor not found');
}
