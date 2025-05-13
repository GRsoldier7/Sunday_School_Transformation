/**
 * Script to mark a row as READY in the spreadsheet
 * after creating the verse image with Python/Pillow
 */

const fs = require('fs');
const path = require('path');
// Load environment variables from the root .env file
require('dotenv').config();

// Import the Google Sheets service
const sheetsService = require('./index');

async function markRowReady() {
  try {
    console.log('Marking row as READY in the spreadsheet...');
    
    // We'll update row 3 which has the Romans 9:30-10:21 study
    // You can modify this to use a different row or to find the row based on the verse reference
    const rowToUpdate = 3;
    
    // Read the verse information from the JSON file
    const projectDir = path.join(__dirname, '../..');
    const verseInfoPath = path.join(projectDir, 'verse-info.json');
    
    if (!fs.existsSync(verseInfoPath)) {
      throw new Error(`Verse information file not found at ${verseInfoPath}`);
    }
    
    const verseInfo = JSON.parse(fs.readFileSync(verseInfoPath, 'utf8'));
    console.log('Verse information:', verseInfo);
    
    // Update the Ready? column with READY
    await sheetsService.writeSheet(`Bible Studies!F${rowToUpdate}`, [['READY']]);
    
    console.log('Row marked as READY successfully!');
    
    // Read the updated row
    const updatedRow = await sheetsService.readSheet(`Bible Studies!A${rowToUpdate}:O${rowToUpdate}`);
    console.log('Updated row:');
    console.log(updatedRow[0].join(' | '));
  } catch (error) {
    console.error('Error marking row as READY:', error.message);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  markRowReady()
    .then(() => {
      console.log('Process completed successfully!');
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { markRowReady };
