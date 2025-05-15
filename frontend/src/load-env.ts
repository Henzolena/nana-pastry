/**
 * Environment Variable Loader for Node.js Scripts
 * 
 * This utility loads environment variables from .env files when running 
 * standalone scripts that are not in the Vite context.
 */

/**
 * Environment Variable Loader for Node.js Scripts
 * 
 * This utility loads environment variables from .env files when running 
 * standalone scripts that are not in the Vite context.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

/**
 * Loads environment variables from .env files
 * Handles fallbacks and environment-specific files
 */
export function loadEnvVariables() {
  // Determine the directory of the current module in an ES module context
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const envFiles = [
    '.env',
    '.env.local',
    `.env.${process.env.NODE_ENV}`,
    `.env.${process.env.NODE_ENV}.local`
  ];
  
  const baseDir = path.resolve(__dirname, '..');
  
  let loaded = false;
  
  console.log('🌱 Loading environment variables...');
  
  for (const file of envFiles) {
    const envPath = path.resolve(baseDir, file);
    
    try {
      if (fs.existsSync(envPath)) {
        console.log(`📄 Loading variables from ${file}`);
        const result = dotenv.config({ path: envPath });
        
        if (result.error) {
          console.warn(`⚠️ Error loading ${file}: ${result.error}`);
        } else {
          loaded = true;
        }
      }
    } catch (error) {
      console.error(`❌ Error checking ${file}: ${error}`);
    }
  }
  
  if (!loaded) {
    console.warn('⚠️ No .env files found or loaded');
  } else {
    console.log('✅ Environment variables loaded successfully');
  }
  
  // Print loaded Firebase config (with API key partially hidden for security)
  console.log('\n🔥 Firebase Environment Variables:');
  const firebaseVars = [
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_STORAGE_BUCKET'
  ];
  
  for (const key of firebaseVars) {
    const value = process.env[key];
    if (value) {
      // Mask API key for security
      if (key === 'VITE_FIREBASE_API_KEY') {
        console.log(`  ${key}: ${value.substring(0, 5)}...${value.substring(value.length - 3)}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    } else {
      console.log(`  ${key}: ❌ Missing`);
    }
  }
}

// Auto-load environment variables when this module is imported
loadEnvVariables();
