# Bible Study Tracker

A comprehensive platform for managing, enhancing, and sharing Bible study sessions using cutting-edge AI technology and integration with Google Sheets.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [Google Sheets Integration](#google-sheets-integration)
- [AI Integration](#ai-integration)
- [Verse Image Generation](#verse-image-generation)
- [Email Digest](#email-digest)
- [MCP Server Integration](#mcp-server-integration)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Future Enhancements](#future-enhancements)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Bible Study Tracker is a modern application designed to transform the way Bible study sessions are recorded, enhanced, and shared. It leverages AI technology to generate insightful summaries, identifies key verses, creates beautiful verse images, and compiles comprehensive email digests. The application integrates with Google Sheets as its primary data store, making it accessible and easy to use for non-technical users.

## Features

- **Session Tracking**: Record and organize Bible study sessions with date, scripture, transcription, and AI-generated summaries.
- **AI Content Generation**: Automatically generate summaries, key takeaways, discussion questions, and next session previews using OpenRouter AI.
- **Verse Image Generation**: Create beautiful images with Bible verses overlaid on relevant backgrounds from Pexels.
- **Email Digest**: Compile and send comprehensive email digests with all session content.
- **Google Sheets Integration**: Store all data in Google Sheets for easy access and editing.
- **MCP Server Integration**: Leverage multiple MCP (Master Control Program) servers for enhanced functionality.

## Architecture

### Frontend

- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **State Management**: React Context API
- **API Client**: Axios

### Backend

- **Framework**: Flask (Python)
- **Image Processing**: Pillow
- **Google Integration**: Google Sheets API
- **External APIs**: OpenRouter, Pexels

### Data Storage

- **Primary Database**: Google Sheets
  - Spreadsheet URL: https://docs.google.com/spreadsheets/d/10Gp6sQ5O211mHs03dAgUhu0fciXyWU0HtG2Jia8aNO0/edit
  - Sheet Structure:
    - Bible Studies: Main sheet for tracking study sessions
    - Columns:
      - Date: Date of the Bible study session
      - Teacher: Name of the teacher/leader
      - Scripture: Bible passage covered (e.g., "Romans 9:30-10:21")
      - Picture: Information about the verse image
      - Category: Theological categories (e.g., "Soteriology, Faith vs. Works")
      - Transcript: Full transcript of the session
      - AI Meeting Summary: AI-generated summary of the session
      - Key Takeaways: Important points from the session
      - Discussion Questions: Questions for further study
      - Ready?: Status of the entry (e.g., "ready", "processing")

## Project Structure

```
bible-study-tracker/
├── backend/                # Flask backend
│   ├── app.py              # Main Flask application
│   ├── services/           # Backend services
│   └── utils/              # Utility functions
├── docs/                   # Documentation
│   ├── google-doc-data-mapping.md # Google Sheet to Google Doc data mapping
│   └── google-doc-newsletter-template.md # Google Doc newsletter template design
├── fonts/                  # Fonts for verse images
├── services/               # Shared services
│   ├── ai/                 # AI integration services
│   │   └── find-best-verse.js # Script to find the best verse
│   ├── google-docs/        # Google Docs integration
│   │   └── generate_newsletter.py # Generate Google Doc newsletter
│   ├── google-sheets/      # Google Sheets integration
│   │   ├── index.js        # Main Google Sheets service
│   │   └── update_with_verse_image.js # Update spreadsheet with verse image
│   └── image/              # Image processing services
│       ├── create_verse_overlay.py # Create verse overlay on image
│       └── create_elegant_verse.py # Create elegant verse image
├── mcp-servers/            # MCP server implementations
├── .env                    # Environment variables
├── create_complete_bible_study.sh # Script to run the complete Bible study process
├── create_newsletter.sh    # Script to generate Google Doc newsletter
├── create_social_graphic.py # Script to create social graphic with verse overlay
├── create_verse_image_and_update_sheet.sh # Script to create verse image and update sheet
├── create_verse_image_with_unsplash.sh # Script to create verse image with Unsplash images
├── fetch_unsplash_image.py # Script to fetch images from Unsplash
└── verse-info.json         # Information about the selected verse
```

## Data Flow

1. **Session Recording**:
   - Bible study sessions are recorded and transcribed
   - Session details are entered into the Google Sheet

2. **AI Processing**:
   - The system reads the transcript and scripture from the Google Sheet
   - OpenRouter AI generates a summary, key takeaways, and discussion questions
   - AI identifies the most representative verse from the scripture passage

3. **Verse Image Generation**:
   - The system selects an appropriate background image
   - The verse text is overlaid on the image using Pillow
   - The image is saved to the desktop and project directory
   - The Google Sheet is updated with information about the image

4. **Email Digest**:
   - The system compiles all session content into an email digest
   - The digest is sent to subscribers

## Google Sheets Integration

The application uses Google Sheets as its primary data store. The integration is handled by the `services/google-sheets/index.js` module.

### Spreadsheet Structure

- **URL**: https://docs.google.com/spreadsheets/d/10Gp6sQ5O211mHs03dAgUhu0fciXyWU0HtG2Jia8aNO0/edit
- **Sheet Name**: Bible Studies
- **Columns**:
  - A: Date (e.g., "2025.05.11")
  - B: Teacher (e.g., "Kerri")
  - C: Scripture (e.g., "Romans 9:30-10:21")
  - D: Picture (Information about the verse image)
  - E: Category (e.g., "Soteriology, Faith vs. Works")
  - F: Transcript (Full transcript of the session)
  - G: AI Meeting Summary (AI-generated summary)
  - H: Key Takeaways (Important points)
  - I: Discussion Questions (Questions for further study)
  - J: Ready? (Status of the entry)

### Authentication

The application uses a Google Service Account for authentication:
- Service account credentials are stored in `services/google-sheets/service-account.json`
- The Google Sheet must be shared with the service account email

### Key Functions

- `readSheet(range)`: Read data from a specific range in the sheet
- `writeSheet(range, values)`: Write data to a specific range in the sheet
- `appendSheet(range, values)`: Append data to a sheet
- `clearSheet(range)`: Clear data from a specific range

## AI Integration

The application uses OpenRouter to generate AI content for Bible study sessions.

### OpenRouter Configuration

- **API Key**: Stored in `.env` file as `OPENROUTER_API_KEY`
- **Default Model**: anthropic/claude-3-opus-20240229
- **Fallback Model**: anthropic/claude-3-sonnet-20240229

### AI Content Generation

The AI generates the following content:
1. **Meeting Summaries**: Concise summaries of the Bible study session
2. **Key Takeaways**: Important points from the session
3. **Discussion Questions**: Thought-provoking questions for further study
4. **Best Verse**: The most representative verse from the scripture passage

### Finding the Best Verse

The `services/ai/find-best-verse.js` module uses OpenRouter to identify the most representative verse from the scripture passage:

1. The script reads the transcript and summary from the Google Sheet
2. It sends a prompt to OpenRouter asking for the most important verse
3. OpenRouter returns the verse reference, text, and explanation
4. The information is saved to `verse-info.json`

## Verse Image Generation

The application creates beautiful images with Bible verses overlaid on relevant backgrounds.

### Image Generation Process

1. **Verse Selection**: The system identifies the most representative verse using AI
2. **Background Selection**: A suitable background image is selected from Unsplash
3. **Text Overlay**: The verse text is overlaid on the image using Pillow
4. **Image Saving**: The image is saved to the desktop and project directory
5. **Spreadsheet Update**: The Google Sheet is updated with information about the image

### Image Styles

The application supports different styles for verse images:
- **Elegant**: Uses script fonts for highlighted text and serif fonts for normal text
- **Bold**: Uses bold fonts with larger text sizes
- **Modern**: Uses modern sans-serif fonts with a clean layout

### Text Formatting

The verse text is formatted with different styles:
- **Normal Text**: Regular text for most of the verse
- **Highlight Text**: Emphasized text for key parts of the verse
- **Reference Text**: Smaller text for the verse reference

### Running the Image Generation

There are multiple scripts available for image generation:

#### Basic Verse Image Generation

To create a basic verse image and update the spreadsheet:
```bash
./create_verse_image_and_update_sheet.sh
```

This script:
1. Installs required Python packages
2. Runs `services/image/create_verse_overlay.py` to create the image
3. Runs `services/google-sheets/update_with_verse_image.js` to update the spreadsheet

#### Verse Image Generation with Unsplash

To create a verse image using Unsplash images and update the spreadsheet:
```bash
./create_verse_image_with_unsplash.sh
```

This script:
1. Installs required Python packages
2. Downloads required fonts if they don't exist
3. Fetches images from Unsplash based on the verse reference
4. Runs `create_social_graphic.py` to create the image with text overlay
5. Runs `services/google-sheets/update_with_verse_image.js` to update the spreadsheet

## Google Doc Newsletter Generation

The application can generate professionally formatted Google Doc newsletters from the Bible study data.

### Newsletter Generation Process

1. **Data Retrieval**: The system retrieves data from the Google Sheet
2. **Document Creation**: A new Google Doc is created with the title from the `Verses Covered` column
3. **Image Insertion**: The verse image is inserted at the top of the document
4. **Content Formatting**: The content is formatted according to the template design
5. **Document Sharing**: The document is shared with the specified users

### Newsletter Template Design

The newsletter follows a professional template design with the following sections:

1. **Document Title**: The title of the document is the scripture reference
2. **Image Section**: The verse image is displayed at the top of the document
3. **Prayer Requests**: Prayer requests related to the Bible study
4. **Key Verse of the Study**: The most representative verse from the scripture passage
5. **Scripture(s) Covered**: The scripture references covered in the study
6. **Bible Study Message**: A summary of the Bible study message
7. **Looking Ahead**: Information about the next Bible study session
8. **Prayer Focus**: A prayer related to the Bible study topic

### Implementation Approaches

There are two ways to implement the newsletter generation:

#### 1. Python Script Approach

This approach uses the Google Docs API with Python to create standalone documents or update existing documents.

To generate a Google Doc newsletter using the Python script:
```bash
./create_newsletter.sh
```

This script:
1. Installs required Python packages
2. Runs `services/google-docs/generate_newsletter.py` to create the Google Doc

#### 2. Google Apps Script Approach (Recommended for Tabs)

This approach uses Google Apps Script to directly update tab documents within a master Google Doc. It provides better integration with the Google Docs environment and can directly access and modify tab documents.

To use the Google Apps Script approach:
1. Open the Google Sheet at https://docs.google.com/spreadsheets/d/10Gp6sQ5O211mHs03dAgUhu0fciXyWU0HtG2Jia8aNO0/edit
2. From the menu, select 'Extensions' > 'Apps Script'
3. Copy and paste the code from `services/google-docs/update_newsletter_tab.js` into the Apps Script editor
4. Save the script (File > Save)
5. Run the 'onOpen' function once to create the menu (select 'onOpen' from the dropdown and click Run)
6. Go back to the spreadsheet and refresh the page
7. You should now see a 'Bible Study' menu in the menu bar
8. Click on 'Bible Study' > 'Update Newsletter Tab' to run the script
9. The script will update the tab document with the content and image

### Complete Bible Study Process

To run the complete Bible study process (verse image generation and newsletter creation):
```bash
./create_complete_bible_study.sh
```

This script:
1. Creates a verse image using Unsplash images
2. Generates a Google Doc newsletter
3. Updates the Google Sheet with the information

## MCP Server Integration

The application integrates with multiple MCP (Master Control Program) servers for enhanced functionality:

| MCP Server | Purpose | API Key Required | Status |
|------------|---------|------------------|--------|
| Context7 | Managing user preferences and session context | No | Implemented |
| Taskmaster (Claude) | AI task orchestration and fallback processing | Yes | Implemented |
| MagicUI | UI component templates and design system | Yes | Implemented |
| Memory | Caching API responses and session data | No | Implemented |
| Knowledge | Bible reference information and resources | No | Implemented |
| GitHub MCP | Repository management and CI/CD | Yes | Implemented |

### MCP Server Configuration

MCP servers are configured in the `.env` file:
```
# MCP Server Configuration
CONTEXT7_BASE_URL=http://localhost:3002
ENABLE_CONTEXT7=true

TASKMASTER_BASE_URL=http://localhost:3003
TASKMASTER_API_KEY=your_taskmaster_api_key
ENABLE_TASKMASTER=true

MAGICUI_BASE_URL=http://localhost:3004
MAGICUI_API_KEY=your_magicui_api_key
ENABLE_MAGICUI=true

MEMORY_BASE_URL=http://localhost:3005
ENABLE_MEMORY=true

KNOWLEDGE_BASE_URL=http://localhost:3006
ENABLE_KNOWLEDGE=true

GITHUB_MCP_BASE_URL=http://localhost:3007
GITHUB_MCP_API_KEY=your_github_mcp_api_key
ENABLE_GITHUB_MCP=true
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- Python 3.9 or higher
- Google Cloud account with Google Sheets API enabled
- OpenRouter API key for AI functionality
- Pexels API key for image search (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/GRsoldier7/Sunday_School_Transformation.git
   cd Sunday_School_Transformation/bible-study-tracker
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```

3. Install service dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Create a `.env` file in the root directory:
   ```
   # Google Sheets Configuration
   GOOGLE_SHEETS_SPREADSHEET_ID=10Gp6sQ5O211mHs03dAgUhu0fciXyWU0HtG2Jia8aNO0
   GOOGLE_SHEETS_SERVICE_ACCOUNT_PATH=./services/google-sheets/service-account.json

   # OpenRouter Configuration
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_API_URL=https://openrouter.ai/api/v1
   OPENROUTER_DEFAULT_MODEL=anthropic/claude-3-opus-20240229
   OPENROUTER_FALLBACK_MODEL=anthropic/claude-3-sonnet-20240229

   # Pexels API Configuration (optional)
   PEXELS_API_KEY=your_pexels_api_key
   ```

2. Set up Google Sheets Service Account:
   - Create a service account in Google Cloud Console
   - Download the service account key as JSON
   - Save it to `services/google-sheets/service-account.json`
   - Share your Google Sheet with the service account email

## Development Workflow

The project follows the Vibe Coding Rulebook for development:

1. **Planning Phase**: Define requirements, create user stories, design architecture
2. **Setup Phase**: Initialize project, set up environment, configure MCP servers
3. **Development Phase**: Implement features, conduct code reviews, maintain documentation
4. **Testing Phase**: Unit testing, integration testing, system testing, user acceptance testing
5. **Deployment Phase**: Prepare environment, deploy to staging, conduct final tests, deploy to production
6. **Maintenance Phase**: Monitor performance, address issues, implement improvements, gather feedback

### Running the Backend

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
flask run
```

### Running the Frontend

```bash
cd frontend
npm run dev
```

### Creating Verse Images

```bash
./create_verse_image_and_update_sheet.sh
```

### Generating Google Doc Newsletters

```bash
./create_newsletter.sh
```

### Running the Complete Bible Study Process

```bash
./create_complete_bible_study.sh
```

## Future Enhancements

1. **Enhanced Image Generation**:
   - Add more customization options for verse images
   - Implement AI-based image selection based on verse content
   - Support for multiple image styles and formats

2. **Advanced AI Features**:
   - Implement more advanced AI features for deeper biblical analysis
   - Add support for cross-referencing with other Bible passages
   - Implement AI-generated study guides

3. **User Interface Improvements**:
   - Develop a web interface for managing Bible study sessions
   - Add support for uploading audio recordings for transcription
   - Implement a preview feature for verse images

4. **Newsletter Enhancements**:
   - Add support for custom templates
   - Implement email delivery of newsletters
   - Add support for PDF export
   - Implement automatic scheduling of newsletter generation

5. **Integration Enhancements**:
   - Add integration with Bible APIs for verse lookup and cross-references
   - Implement integration with popular Bible study tools
   - Add support for exporting content to different formats

## Troubleshooting

### Common Issues

1. **Google Sheets API Authentication**:
   - Ensure the service account JSON file is correctly formatted
   - Verify that the Google Sheet is shared with the service account email
   - Check that the Google Sheets API is enabled in the Google Cloud Console

2. **OpenRouter API Issues**:
   - Verify that the API key is correct
   - Check that the model names are correctly specified
   - Ensure that you have sufficient credits for API calls

3. **Image Generation Issues**:
   - Ensure that Pillow is correctly installed
   - Verify that the required fonts are available on your system
   - Check that the output directories are writable

4. **Google Docs API Issues**:
   - Ensure that the Google Docs API is enabled in the Google Cloud Console
   - Verify that the service account has permission to create and edit documents
   - Check that the required scopes are included in the credentials

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
