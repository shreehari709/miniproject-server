import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Priority 1: Check for root .env
const rootEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  // Priority 2: Check for server .env
  const serverEnvPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(serverEnvPath)) {
    dotenv.config({ path: serverEnvPath });
  } else {
    dotenv.config();
  }
}

export default process.env;
