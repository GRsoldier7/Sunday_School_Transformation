/**
 * Bible Study Sermon Tracker - Google Apps Script
 * 
 * This script automates the process of generating AI content, compiling email digests,
 * and sending emails for Bible study sessions.
 */

// Constants
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_DEFAULT_MODEL = 'anthropic/claude-3-opus-20240229';
const OPENROUTER_FALLBACK_MODEL = 'anthropic/claude-3-sonnet-20240229';

// Column indices (0-based)
const COL_ID = 0;
const COL_DATE = 1;
const COL_SCRIPTURE = 2;
const COL_TRANSCRIPTION = 3;
const COL_PLAUD_SYNOPSIS = 4;
const COL_PRAYER_REQUESTS = 5;
const COL_KEY_VERSE = 6;
const COL_IMAGE_QUERY = 7;
const COL_IMAGE_URL = 8;
const COL_AI_SUMMARY = 9;
const COL_ENHANCED_COMMENTARY = 10;
const COL_NEXT_SESSION_PREVIEW = 11;
const COL_EMAIL_STATUS = 12;
const COL_EMAIL_SENT_TIMESTAMP = 13;
const COL_ERROR_LOG = 14;

/**
 * Trigger function that runs when the spreadsheet is edited
 */
function onEdit(e) {
  try {
    // Get the edited range
    const range = e.range;
    const sheet = range.getSheet();
    
    // Only process edits in the Sessions sheet
    if (sheet.getName() !== 'Sessions') {
      return;
    }
    
    const row = range.getRow();
    const col = range.getColumn();
    
    // Skip header row
    if (row === 1) {
      return;
    }
    
    // Check if the edited cell is in the Transcription or PLAUD AI Synopsis column
    if (col === COL_TRANSCRIPTION + 1 || col === COL_PLAUD_SYNOPSIS + 1) {
      // Get the row data
      const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      // Check if both Transcription and PLAUD AI Synopsis are filled
      if (rowData[COL_TRANSCRIPTION] && rowData[COL_PLAUD_SYNOPSIS]) {
        // Check if AI processing is already done or in progress
        const emailStatus = rowData[COL_EMAIL_STATUS];
        if (emailStatus && ['AI Processing', 'AI Complete', 'Email Draft Ready', 'Send Now', 'Email Sent'].includes(emailStatus)) {
          return;
        }
        
        // Update status to indicate AI processing is starting
        sheet.getRange(row, COL_EMAIL_STATUS + 1).setValue('AI Processing');
        
        // Process the session with AI
        processSessionWithAI(sheet, row, rowData);
      }
    }
    
    // Check if the edited cell is in the Email Status column
    if (col === COL_EMAIL_STATUS + 1) {
      const status = range.getValue();
      
      // If status is "Send Now", send the email
      if (status === 'Send Now') {
        sendEmailDigest(sheet, row);
      }
    }
  } catch (error) {
    logError('onEdit', error);
  }
}

/**
 * Process a session with AI to generate summary, commentary, and next session preview
 */
function processSessionWithAI(sheet, row, rowData) {
  try {
    // Get the necessary data for AI processing
    const scripture = rowData[COL_SCRIPTURE];
    const transcription = rowData[COL_TRANSCRIPTION];
    const plaudSynopsis = rowData[COL_PLAUD_SYNOPSIS];
    
    // Generate AI content
    const aiSummary = generateAISummary(scripture, transcription, plaudSynopsis);
    const enhancedCommentary = generateEnhancedCommentary(scripture, transcription, plaudSynopsis);
    const nextSessionPreview = generateNextSessionPreview(scripture, transcription, plaudSynopsis);
    
    // Update the sheet with the generated content
    sheet.getRange(row, COL_AI_SUMMARY + 1).setValue(aiSummary);
    sheet.getRange(row, COL_ENHANCED_COMMENTARY + 1).setValue(enhancedCommentary);
    sheet.getRange(row, COL_NEXT_SESSION_PREVIEW + 1).setValue(nextSessionPreview);
    
    // Check if we can compile the email draft
    const keyVerse = rowData[COL_KEY_VERSE];
    const imageUrl = rowData[COL_IMAGE_URL];
    const prayerRequests = rowData[COL_PRAYER_REQUESTS];
    
    if (keyVerse && imageUrl) {
      // Generate closing prayer
      const closingPrayer = generateClosingPrayer(scripture, transcription, plaudSynopsis);
      
      // Compile email draft
      const emailDraft = compileEmailDraft(
        rowData[COL_DATE],
        scripture,
        keyVerse,
        imageUrl,
        prayerRequests,
        aiSummary,
        enhancedCommentary,
        nextSessionPreview,
        closingPrayer
      );
      
      // Store the email draft in a hidden column or in the script properties
      PropertiesService.getScriptProperties().setProperty(`emailDraft_${row}`, emailDraft);
      
      // Update status to indicate email draft is ready
      sheet.getRange(row, COL_EMAIL_STATUS + 1).setValue('Email Draft Ready');
    } else {
      // Update status to indicate AI processing is complete but email draft is not ready
      sheet.getRange(row, COL_EMAIL_STATUS + 1).setValue('AI Complete');
    }
  } catch (error) {
    // Log the error and update the status
    logError(`processSessionWithAI (Row ${row})`, error);
    sheet.getRange(row, COL_EMAIL_STATUS + 1).setValue('AI Error');
    sheet.getRange(row, COL_ERROR_LOG + 1).setValue(`AI Processing Error: ${error.toString()}`);
  }
}

/**
 * Generate AI summary using OpenRouter API
 */
function generateAISummary(scripture, transcription, plaudSynopsis) {
  const prompt = `
    You are a Bible study assistant helping to summarize a sermon or Bible study session.
    
    Scripture: ${scripture}
    
    Transcription: ${transcription}
    
    PLAUD AI Synopsis: ${plaudSynopsis}
    
    Please provide a concise summary (250-300 words) of the key points and theological insights from this Bible study session.
    Focus on the main message, key verses discussed, and practical applications.
  `;
  
  return callOpenRouterAPI(prompt);
}

/**
 * Generate enhanced commentary using OpenRouter API
 */
function generateEnhancedCommentary(scripture, transcription, plaudSynopsis) {
  const prompt = `
    You are a Bible study assistant helping to create an enhanced commentary for a sermon or Bible study session.
    
    Scripture: ${scripture}
    
    Transcription: ${transcription}
    
    PLAUD AI Synopsis: ${plaudSynopsis}
    
    Please provide an enhanced commentary (400-500 words) that includes:
    1. Cross-references to other relevant Bible passages
    2. Historical and cultural context
    3. Theological significance
    4. Links to recommended resources (books, articles, videos) for further study
    5. Discussion questions for group reflection
    
    Format the commentary with clear headings and bullet points where appropriate.
  `;
  
  return callOpenRouterAPI(prompt);
}

/**
 * Generate next session preview using OpenRouter API
 */
function generateNextSessionPreview(scripture, transcription, plaudSynopsis) {
  const prompt = `
    You are a Bible study assistant helping to prepare for the next session.
    
    Current Scripture: ${scripture}
    
    Current Transcription: ${transcription}
    
    Current PLAUD AI Synopsis: ${plaudSynopsis}
    
    Based on the current Bible study session, please suggest a topic and scripture passage for the next session (150-200 words).
    Include:
    1. Recommended scripture passage(s)
    2. Brief explanation of why this would be a good follow-up
    3. 2-3 key themes to explore
    4. A thought-provoking question to consider before the next session
  `;
  
  return callOpenRouterAPI(prompt);
}

/**
 * Generate closing prayer using OpenRouter API
 */
function generateClosingPrayer(scripture, transcription, plaudSynopsis) {
  const prompt = `
    You are a Bible study assistant helping to create a closing prayer.
    
    Scripture: ${scripture}
    
    Transcription: ${transcription}
    
    PLAUD AI Synopsis: ${plaudSynopsis}
    
    Please write a heartfelt closing prayer (100-150 words) that:
    1. Reflects the main themes of the Bible study
    2. Asks for God's help in applying the lessons learned
    3. Expresses gratitude for the insights gained
    4. Concludes with hope for continued growth and understanding
    
    The prayer should be respectful, reverent, and in a tone appropriate for Christian worship.
  `;
  
  return callOpenRouterAPI(prompt);
}

/**
 * Call the OpenRouter API with fallback logic
 */
function callOpenRouterAPI(prompt, model = OPENROUTER_DEFAULT_MODEL) {
  try {
    // Get the API key from script properties
    const apiKey = PropertiesService.getScriptProperties().getProperty('OPENROUTER_API_KEY');
    if (!apiKey) {
      throw new Error('OpenRouter API key not found in script properties');
    }
    
    // Prepare the request payload
    const payload = {
      model: model,
      messages: [
        { role: 'system', content: 'You are a helpful Bible study assistant.' },
        { role: 'user', content: prompt }
      ]
    };
    
    // Make the API request
    const response = UrlFetchApp.fetch(OPENROUTER_API_URL, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://bible-study-tracker.example.com'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    // Parse the response
    const responseData = JSON.parse(response.getContentText());
    
    // Check for errors
    if (response.getResponseCode() !== 200) {
      throw new Error(`API Error: ${responseData.error?.message || 'Unknown error'}`);
    }
    
    // Extract and return the generated content
    return responseData.choices[0].message.content.trim();
  } catch (error) {
    // If using the default model failed, try the fallback model
    if (model === OPENROUTER_DEFAULT_MODEL) {
      Logger.log(`Error with default model: ${error}. Trying fallback model...`);
      return callOpenRouterAPI(prompt, OPENROUTER_FALLBACK_MODEL);
    }
    
    // If we're already using the fallback model, or some other error occurred, throw the error
    throw error;
  }
}

/**
 * Compile email draft with all content
 */
function compileEmailDraft(date, scripture, keyVerse, imageUrl, prayerRequests, aiSummary, enhancedCommentary, nextSessionPreview, closingPrayer) {
  // Format the date
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create the HTML email content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bible Study Digest: ${scripture}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .date {
          color: #666;
          font-style: italic;
        }
        .scripture {
          font-weight: bold;
          font-size: 18px;
          margin: 10px 0;
        }
        .verse-image {
          width: 100%;
          max-width: 600px;
          margin: 20px 0;
          border-radius: 8px;
        }
        h2 {
          color: #2c5282;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 5px;
          margin-top: 25px;
        }
        .prayer-requests {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .next-session {
          background-color: #f0f4ff;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .closing-prayer {
          font-style: italic;
          margin: 20px 0;
          padding: 10px;
          border-left: 3px solid #2c5282;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Bible Study Digest</h1>
        <p class="date">${formattedDate}</p>
        <p class="scripture">${scripture}</p>
      </div>
      
      <img src="${imageUrl}" alt="${keyVerse}" class="verse-image">
      
      <h2>Sermon Message</h2>
      <div>${aiSummary.replace(/\n/g, '<br>')}</div>
      
      <h2>Prayer Requests</h2>
      <div class="prayer-requests">
        ${prayerRequests ? prayerRequests.replace(/\n/g, '<br>') : 'No prayer requests for this session.'}
      </div>
      
      <h2>Enhanced Commentary</h2>
      <div>${enhancedCommentary.replace(/\n/g, '<br>')}</div>
      
      <h2>Next Week's Study</h2>
      <div class="next-session">
        ${nextSessionPreview.replace(/\n/g, '<br>')}
      </div>
      
      <h2>Closing Prayer</h2>
      <div class="closing-prayer">
        ${closingPrayer.replace(/\n/g, '<br>')}
      </div>
      
      <div class="footer">
        <p>Bible Study Sermon Tracker | Automatically generated email digest</p>
      </div>
    </body>
    </html>
  `;
  
  return htmlContent;
}

/**
 * Send email digest
 */
function sendEmailDigest(sheet, row) {
  try {
    // Get the row data
    const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Get the email draft from script properties
    const emailDraft = PropertiesService.getScriptProperties().getProperty(`emailDraft_${row}`);
    if (!emailDraft) {
      throw new Error('Email draft not found');
    }
    
    // Get the recipient email from script properties
    const recipientEmail = PropertiesService.getScriptProperties().getProperty('RECIPIENT_EMAIL');
    if (!recipientEmail) {
      throw new Error('Recipient email not found in script properties');
    }
    
    // Get the scripture and date for the subject line
    const scripture = rowData[COL_SCRIPTURE];
    const date = new Date(rowData[COL_DATE]).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Send the email
    GmailApp.sendEmail(
      recipientEmail,
      `Bible Study Digest: ${scripture} (${date})`,
      'This email requires HTML to display properly.',
      {
        htmlBody: emailDraft,
        name: 'Bible Study Tracker'
      }
    );
    
    // Update the status and timestamp
    const timestamp = new Date().toISOString();
    sheet.getRange(row, COL_EMAIL_STATUS + 1).setValue('Email Sent');
    sheet.getRange(row, COL_EMAIL_SENT_TIMESTAMP + 1).setValue(timestamp);
    
    // Clear the error log if there was one
    sheet.getRange(row, COL_ERROR_LOG + 1).setValue('');
  } catch (error) {
    // Log the error and update the status
    logError(`sendEmailDigest (Row ${row})`, error);
    sheet.getRange(row, COL_EMAIL_STATUS + 1).setValue('Email Error');
    sheet.getRange(row, COL_ERROR_LOG + 1).setValue(`Email Sending Error: ${error.toString()}`);
    
    // Send error notification
    sendErrorNotification(`Failed to send email digest for row ${row}`, error);
  }
}

/**
 * Log an error to the script log and optionally to a log sheet
 */
function logError(context, error) {
  const errorMessage = `${context}: ${error.toString()}`;
  Logger.log(errorMessage);
  
  // Get or create the Error_Logs sheet
  let sheet;
  try {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Error_Logs');
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Error_Logs');
      sheet.appendRow(['Timestamp', 'Context', 'Error Message']);
    }
    
    // Log the error
    sheet.appendRow([new Date().toISOString(), context, error.toString()]);
  } catch (e) {
    // If we can't log to the sheet, just log to the script log
    Logger.log(`Error logging to sheet: ${e.toString()}`);
  }
  
  return errorMessage;
}

/**
 * Send an error notification email
 */
function sendErrorNotification(subject, error) {
  try {
    // Get the admin email from script properties
    const adminEmail = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');
    if (!adminEmail) {
      Logger.log('Admin email not found in script properties');
      return;
    }
    
    // Send the notification
    GmailApp.sendEmail(
      adminEmail,
      `Bible Study Tracker Error: ${subject}`,
      `An error occurred in the Bible Study Tracker script:\n\n${error.toString()}\n\nPlease check the Error_Logs sheet for more details.`,
      {
        name: 'Bible Study Tracker Error Notification'
      }
    );
  } catch (e) {
    Logger.log(`Error sending notification: ${e.toString()}`);
  }
}

/**
 * Web app endpoint to trigger email sending
 */
function doPost(e) {
  try {
    // Parse the request parameters
    const params = JSON.parse(e.postData.contents);
    const sessionId = params.sessionId;
    
    if (!sessionId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Session ID is required'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the Sessions sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sessions');
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sessions sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Find the row for the session ID
    const data = sheet.getDataRange().getValues();
    let row = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][COL_ID].toString() === sessionId.toString()) {
        row = i + 1; // +1 because array is 0-based but sheet rows are 1-based
        break;
      }
    }
    
    if (row === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Session not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Update the email status to trigger sending
    sheet.getRange(row, COL_EMAIL_STATUS + 1).setValue('Send Now');
    
    // Send the email
    sendEmailDigest(sheet, row);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Email sending triggered successfully'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    logError('doPost', error);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
