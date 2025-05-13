#!/bin/bash
# Script to create a verse image using Unsplash images and update the spreadsheet

# Change to the project directory
cd "$(dirname "$0")"

# Install required Python packages if not already installed
echo "Installing required Python packages..."
pip install pillow requests

# Create fonts directory if it doesn't exist
mkdir -p fonts

# Download required fonts if they don't exist
if [ ! -f "fonts/Sacramento-Regular.ttf" ]; then
  echo "Downloading fonts..."
  curl -o fonts/Sacramento-Regular.ttf https://github.com/google/fonts/raw/main/ofl/sacramento/Sacramento-Regular.ttf
  curl -o fonts/DMSans-Regular.ttf https://github.com/google/fonts/raw/main/ofl/dmsans/DMSans-Regular.ttf
  curl -o fonts/RedHatDisplay-Regular.ttf https://github.com/google/fonts/raw/main/ofl/redhatdisplay/RedHatDisplay-Regular.ttf
  curl -o fonts/TiltWarp-Regular.ttf https://github.com/google/fonts/raw/main/ofl/tiltwarp/TiltWarp-Regular.ttf

  # For the highlight font, we'll use a fallback since SeaportScript is not freely available
  curl -o fonts/SeaportScript-Regular.otf https://github.com/google/fonts/raw/main/ofl/dancingscript/DancingScript-Regular.ttf
fi

# Get the verse reference from verse-info.json if it exists
if [ -f "verse-info.json" ]; then
  VERSE_REFERENCE=$(grep -o '"reference": *"[^"]*"' verse-info.json | cut -d'"' -f4)
  echo "Found verse reference: $VERSE_REFERENCE"

  # Extract keywords from the verse reference
  BOOK=$(echo "$VERSE_REFERENCE" | cut -d' ' -f1)

  # Run the Python script to fetch images from Unsplash with the book name as part of the query
  echo "Fetching images from Unsplash for $BOOK..."
  python fetch_unsplash_image.py --query "$BOOK nature landscape mountains" --output-dir "."
else
  # Run the Python script to fetch images from Unsplash with default query
  echo "Fetching images from Unsplash..."
  python fetch_unsplash_image.py --output-dir "."
fi

# Get the first downloaded image
UNSPLASH_IMAGE=$(ls -t unsplash_image_*.jpg 2>/dev/null | head -1)

if [ -z "$UNSPLASH_IMAGE" ]; then
  echo "No Unsplash image found. Using default image..."
  # Use a default image if no Unsplash image is found
  UNSPLASH_IMAGE="verse-image.jpg"
fi

# Run the Python script to create the verse image
echo "Creating verse image with Unsplash image..."
python create_social_graphic.py "$UNSPLASH_IMAGE" "verse-image.jpg" --font-dir "fonts"

# Run the JavaScript script to update the spreadsheet
echo "Updating spreadsheet with verse image information..."
node services/google-sheets/update_with_verse_image.js

echo "Process completed successfully!"
