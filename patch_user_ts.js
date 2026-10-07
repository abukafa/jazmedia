const fs = require('fs');
let code = fs.readFileSync('d:/Libraries/Apps/jazmedia/src/lib/actions/user.ts', 'utf8');

code = code.replace(
  'export async function getPublicProfile(userId: string) {\n  try {\n    const res = await apiClient.get(`/media/users/${userId}/public`);',
  'export async function getPublicProfile(userId: string, type: string = "user") {\n  try {\n    const res = await apiClient.get(`/media/users/${userId}/public?type=${type}`);'
);

const getTeacherProfileStart = code.indexOf('export async function getTeacherProfile');
const getTeacherProfileEnd = code.indexOf('export async function updateUserInstagram', getTeacherProfileStart);
const oldTeacherFunc = code.substring(getTeacherProfileStart, getTeacherProfileEnd);

code = code.replace(
  oldTeacherFunc,
  'export async function getTeacherProfile(userId: string) {\n  return getPublicProfile(userId, "teacher");\n}\n\n'
);

fs.writeFileSync('d:/Libraries/Apps/jazmedia/src/lib/actions/user.ts', code);
console.log('done');
