#!/bin/bash
# Script to create a complete Bible study with verse image and newsletter

# Change to the project directory
cd "$(dirname "$0")"

# Check if the Google Sheets spreadsheet ID is set
if [ -z "$GOOGLE_SHEETS_SPREADSHEET_ID" ]; then
  echo "GOOGLE_SHEETS_SPREADSHEET_ID environment variable not set"
  echo "Setting it to the default value..."
  export GOOGLE_SHEETS_SPREADSHEET_ID="10Gp6sQ5O211mHs03dAgUhu0fciXyWU0HtG2Jia8aNO0"
fi

# Step 1: Create the verse image using Unsplash images
echo "Step 1: Creating verse image using Unsplash images..."
./create_verse_image_with_unsplash.sh

# Step 2: Generate the newsletter
echo "Step 2: Generating the newsletter..."
./create_newsletter.sh

# Step 3: Instructions for updating the tab document using Google Apps Script
echo "Step 3: Updating the tab document in Google Docs..."
echo "To update the tab document with the verse image, please follow these steps:"
echo "1. Open the Google Sheet at https://docs.google.com/spreadsheets/d/$GOOGLE_SHEETS_SPREADSHEET_ID/edit"
echo "2. From the menu, select 'Extensions' > 'Apps Script'"
echo "3. Copy and paste the code from services/google-docs/update_newsletter_tab.js into the Apps Script editor"
echo "4. Save the script (File > Save)"
echo "5. Run the 'onOpen' function once to create the menu (select 'onOpen' from the dropdown and click Run)"
echo "6. Go back to the spreadsheet and refresh the page"
echo "7. You should now see a 'Bible Study' menu in the menu bar"
echo "8. Click on 'Bible Study' > 'Update Newsletter Tab' to run the script"
echo "9. The script will update the tab document with the content and image"

# Open the Google Sheet in the browser
echo "Opening the Google Sheet in your browser..."
if command -v open >/dev/null 2>&1; then
  open "https://docs.google.com/spreadsheets/d/$GOOGLE_SHEETS_SPREADSHEET_ID/edit"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "https://docs.google.com/spreadsheets/d/$GOOGLE_SHEETS_SPREADSHEET_ID/edit"
elif command -v start >/dev/null 2>&1; then
  start "https://docs.google.com/spreadsheets/d/$GOOGLE_SHEETS_SPREADSHEET_ID/edit"
fi

echo "Bible study creation completed successfully!"
echo "You can view the spreadsheet at: https://docs.google.com/spreadsheets/d/$GOOGLE_SHEETS_SPREADSHEET_ID/edit"
echo "You can view the tab document at: https://docs.google.com/document/d/1ajkbv0t3Ri6igCKBtR1H_0KGzc-HQCjICszJAfGqhSc/edit"
