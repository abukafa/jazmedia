import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getDriveClient } from './src/lib/drive';

async function test() {
  try {
    const drive = getDriveClient();
    console.log('Client initialized');
    const res = await drive.files.list({ pageSize: 1 });
    console.log('SUCCESS API Call! Files found:', res.data.files?.length);
  } catch (err: any) {
    console.error('FAIL API Call:', err.message);
    if (err.response) {
      console.error('Response details:', err.response.data);
    }
  }
}

test();
