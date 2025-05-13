#!/bin/bash
# Script to create a verse image using Python/Pillow and update the spreadsheet

# Change to the project directory
cd "$(dirname "$0")"

# Install required Python packages if not already installed
echo "Installing required Python packages..."
pip install pillow requests

# Run the Python script to create the verse image
echo "Creating verse overlay on image without darkening..."
python services/image/create_verse_overlay.py

# Run the JavaScript script to update the spreadsheet
echo "Updating spreadsheet with verse image information..."
node services/google-sheets/update_with_verse_image.js

echo "Process completed successfully!"
