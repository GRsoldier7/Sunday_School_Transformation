/**
 * Script to update a tab in a Google Doc with Bible Study data from a Google Sheet.
 */

// Constants
const TARGET_DOC_ID = '1kchm4o3FMugKpgBTfedjrPND44Mz0W4y2e0wabCnwEo'; // The main document with tabs
const ROMANS_TAB_DOC_ID = '1ajkbv0t3Ri6igCKBtR1H_0KGzc-HQCjICszJAfGqhSc'; // The specific tab document for Romans 9:30-10:21
const SPREADSHEET_ID = '10Gp6sQ5O211mHs03dAgUhu0fciXyWU0HtG2Jia8aNO0'; // Bible Study spreadsheet
const SHEET_NAME = 'Bible Studies';
const STATUS_COLUMN_NAME = 'Ready?';

/**
 * Main function to update the newsletter tab.
 */
function updateNewsletterTab() {
  try {
    // Get the data from the spreadsheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      Logger.log(`Sheet "${SHEET_NAME}" not found.`);
      return;
    }

    // Get all data from the sheet
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0]; // First row is headers

    // Find the index of the status column
    const statusColumnIndex = headers.indexOf(STATUS_COLUMN_NAME);
    if (statusColumnIndex === -1) {
      Logger.log(`Status column "${STATUS_COLUMN_NAME}" not found in headers.`);
      return;
    }

    // Process each row
    let processedCount = 0;
    for (let i = 1; i < values.length; i++) { // Start from row 2 (index 1)
      const row = values[i];
      const status = row[statusColumnIndex];

      // Check if the row is ready for processing
      if (status === 'READY') {
        try {
          // Get the data from the row
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });

          // Update the tab document
          updateTabDocument(ROMANS_TAB_DOC_ID, rowData);
          processedCount++;
        } catch (e) {
          Logger.log(`Error processing row ${i + 1}: ${e.toString()}`);
        }
      }
    }

    if (processedCount > 0) {
      Logger.log(`${processedCount} row(s) processed successfully.`);
    } else {
      Logger.log('No rows to process.');
    }
  } catch (e) {
    Logger.log(`Error: ${e.toString()}`);
  }
}

/**
 * Updates a tab document with the data from a row.
 * @param {string} docId - The ID of the tab document to update.
 * @param {Object} data - The data from the row.
 */
function updateTabDocument(docId, data) {
  try {
    // Open the document
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();

    // Clear the document content
    body.clear();

    // Add the title
    const title = data['Verses Covered'] || 'Bible Study';
    const titleParagraph = body.appendParagraph(title);
    titleParagraph.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    titleParagraph.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    // Add a space after the title
    body.appendParagraph('');

    // Insert the image if available
    const imageId = data['Picture'];
    if (imageId && imageId !== '') {
      try {
        // If the image ID is a Drive file ID
        if (imageId.length > 10 && !imageId.startsWith('http')) {
          // Get the image from Drive
          const imageBlob = DriveApp.getFileById(imageId).getBlob();
          // Insert the image
          const image = body.appendImage(imageBlob);
          // Center the image
          image.getParent().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
          // Add a space after the image
          body.appendParagraph('');
        }
        // If the image is a URL
        else if (imageId.startsWith('http')) {
          // Fetch the image from the URL
          const imageBlob = UrlFetchApp.fetch(imageId).getBlob();
          // Insert the image
          const image = body.appendImage(imageBlob);
          // Center the image
          image.getParent().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
          // Add a space after the image
          body.appendParagraph('');
        }
      } catch (e) {
        Logger.log(`Error inserting image: ${e.toString()}`);
        // Continue without the image
      }
    }

    // Add sections
    addSection(body, 'Prayer Requests', data['Prayer Requests'] || 'No specific prayer requests noted for this week.');
    addSection(body, 'Key Verse of the Study', data['Key verse of the Study'] || '');
    addSection(body, 'Scripture(s) Covered', data['Verses Covered'] || '');
    addSection(body, 'Bible Study Message', data['AI Meeting Summary'] || '');
    addSection(body, 'Looking Ahead', data['Next Week Verses'] || 'To be updated.');
    addSection(body, 'Prayer Focus', data['AI Prayer Focus'] || '');

    // Save the document
    doc.saveAndClose();
    Logger.log(`Document ${docId} updated successfully.`);
    return true;
  } catch (e) {
    Logger.log(`Error updating document ${docId}: ${e.toString()}`);
    return false;
  }
}

/**
 * Adds a section to the document.
 * @param {Body} body - The document body.
 * @param {string} heading - The section heading.
 * @param {string} content - The section content.
 */
function addSection(body, heading, content) {
  if (!content) return;

  // Add the section heading
  const headingParagraph = body.appendParagraph(heading);
  headingParagraph.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  headingParagraph.setAttributes({
    [DocumentApp.Attribute.FONT_SIZE]: 14,
    [DocumentApp.Attribute.BOLD]: true
  });

  // Add the section content
  const contentParagraph = body.appendParagraph(content);
  contentParagraph.setAttributes({
    [DocumentApp.Attribute.FONT_SIZE]: 11
  });

  // Add a space after the section
  body.appendParagraph('');
}

/**
 * Creates a menu item to run the script manually.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Bible Study')
    .addItem('Update Newsletter Tab', 'updateNewsletterTab')
    .addToUi();
}
