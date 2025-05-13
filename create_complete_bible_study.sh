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

echo "Bible study creation completed successfully!"
echo "You can view the spreadsheet at: https://docs.google.com/spreadsheets/d/$GOOGLE_SHEETS_SPREADSHEET_ID/edit"
