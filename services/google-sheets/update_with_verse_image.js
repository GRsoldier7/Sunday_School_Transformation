/**
 * Script to update the spreadsheet with verse image information
 * after creating the image with Python/Pillow
 */

const fs = require('fs');
const path = require('path');
// Load environment variables from the root .env file
require('dotenv').config();

// Import the Google Sheets service
const sheetsService = require('./index');

async function updateSpreadsheetWithVerseImage() {
  try {
    console.log('Updating spreadsheet with verse image information...');
    
    // We'll update row 3 which has the Romans 9:30-10:21 study
    const rowToUpdate = 3;
    
    // Read the verse information from the JSON file
    const projectDir = path.join(__dirname, '../..');
    const verseInfoPath = path.join(projectDir, 'verse-info.json');
    
    if (!fs.existsSync(verseInfoPath)) {
      throw new Error(`Verse information file not found at ${verseInfoPath}`);
    }
    
    const verseInfo = JSON.parse(fs.readFileSync(verseInfoPath, 'utf8'));
    console.log('Verse information:', verseInfo);
    
    // Create a detailed note about the image
    const imageNote = `Verse image created with:
Reference: ${verseInfo.reference}
Text: ${verseInfo.text}
Image saved to desktop: ${path.basename(verseInfo.image_path)}`;
    
    // Update the Picture column (column D) with the note
    await sheetsService.writeSheet(`Bible Studies!D${rowToUpdate}`, [[imageNote]]);
    
    console.log('Spreadsheet updated successfully!');
    
    // Read the updated row
    const updatedRow = await sheetsService.readSheet(`Bible Studies!A${rowToUpdate}:O${rowToUpdate}`);
    console.log('Updated row:');
    console.log(updatedRow[0].join(' | '));
  } catch (error) {
    console.error('Error updating spreadsheet:', error.message);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  updateSpreadsheetWithVerseImage()
    .then(() => {
      console.log('Process completed successfully!');
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { updateSpreadsheetWithVerseImage };
