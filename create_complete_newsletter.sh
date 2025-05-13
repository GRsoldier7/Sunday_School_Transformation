#!/bin/bash
# Script to create a complete Bible study newsletter with verse image and Google Doc update

# Set the current directory to the script's directory
cd "$(dirname "$0")"

# Load environment variables
if [ -f .env ]; then
  source .env
fi

# Check if required environment variables are set
if [ -z "$GOOGLE_SHEETS_SPREADSHEET_ID" ]; then
  echo "Error: GOOGLE_SHEETS_SPREADSHEET_ID environment variable not set"
  exit 1
fi

echo "Starting complete Bible study newsletter process..."

# Step 1: Create verse image with Unsplash
echo "Step 1: Creating verse image with Unsplash..."
./create_verse_image_with_unsplash.sh

# Step 2: Mark the row as READY in the spreadsheet
echo "Step 2: Marking the row as READY in the spreadsheet..."
node services/google-sheets/mark_row_ready.js

# Step 3: Instructions for the Google Apps Script
echo "Step 3: The Google Apps Script will automatically process the row"
echo "If auto-processing is set up, the row will be processed automatically."
echo "Otherwise, you can manually process it from the 'Bible Study' menu in the spreadsheet."
echo ""
echo "To set up auto-processing:"
echo "1. Open the Google Sheet at https://docs.google.com/spreadsheets/d/$GOOGLE_SHEETS_SPREADSHEET_ID/edit"
echo "2. Click on 'Bible Study' in the menu bar"
echo "3. Click on 'Set Up Auto-Processing'"
echo ""
echo "To manually process the row:"
echo "1. Open the Google Sheet at https://docs.google.com/spreadsheets/d/$GOOGLE_SHEETS_SPREADSHEET_ID/edit"
echo "2. Click on 'Bible Study' in the menu bar"
echo "3. Click on 'Process Selected Row' (after selecting the row) or 'Generate All Ready Newsletters'"

# Open the Google Sheet in the browser
if command -v open >/dev/null 2>&1; then
  open "https://docs.google.com/spreadsheets/d/$GOOGLE_SHEETS_SPREADSHEET_ID/edit"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "https://docs.google.com/spreadsheets/d/$GOOGLE_SHEETS_SPREADSHEET_ID/edit"
elif command -v start >/dev/null 2>&1; then
  start "https://docs.google.com/spreadsheets/d/$GOOGLE_SHEETS_SPREADSHEET_ID/edit"
fi

echo "Process completed successfully!"
