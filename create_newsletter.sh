#!/bin/bash
# Script to generate a Google Doc newsletter from Bible Study data

# Change to the project directory
cd "$(dirname "$0")"

# Install required Python packages if not already installed
echo "Installing required Python packages..."
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib

# Run the Python script to generate the newsletter
echo "Generating Google Doc newsletter..."
python services/google-docs/generate_newsletter.py $1

echo "Process completed successfully!"
