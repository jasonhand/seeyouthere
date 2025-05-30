#!/usr/bin/env node

/**
 * Auto-update manifest.json with all calendar files
 * 
 * Usage: node update-manifest.js
 * 
 * This script will scan the custom-calendars directory for all .json files
 * (except manifest.json itself) and update the manifest.json file automatically.
 */

const fs = require('fs');
const path = require('path');

const CALENDAR_DIR = __dirname;
const MANIFEST_FILE = path.join(CALENDAR_DIR, 'manifest.json');

try {
  // Read all files in the directory
  const files = fs.readdirSync(CALENDAR_DIR);
  
  // Filter for JSON files, excluding manifest.json and this script
  const calendarFiles = files.filter(file => 
    file.endsWith('.json') && 
    file !== 'manifest.json' &&
    file !== 'package.json'
  );
  
  // Create or update manifest
  const manifest = {
    calendars: calendarFiles.sort() // Sort alphabetically for consistency
  };
  
  // Write the updated manifest
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  
  console.log('✅ Manifest updated successfully!');
  console.log(`📅 Found ${calendarFiles.length} calendar(s):`);
  calendarFiles.forEach(file => console.log(`   - ${file}`));
  
} catch (error) {
  console.error('❌ Error updating manifest:', error.message);
  process.exit(1);
} 