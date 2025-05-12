# Bible Study Sermon Tracker, Image Generator & Email Digest

A comprehensive application for tracking Bible study sessions, generating AI-enhanced content, creating verse images, and sending email digests.

## Features

- **Session Tracking**: Record and organize Bible study sessions with date, scripture, transcription, and PLAUD AI synopsis.
- **AI Content Generation**: Automatically generate summaries, enhanced commentaries, and next session previews using OpenRouter AI.
- **Verse Image Generation**: Create beautiful images with Bible verses overlaid on relevant backgrounds from Pexels.
- **Email Digest**: Compile and send comprehensive email digests with all session content.
- **MCP Server Integration**: Leverage multiple MCP servers for enhanced functionality.

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

### MCP Servers

This project integrates with the following MCP (Master Control Program) servers:

1. **Context7**: For managing user preferences and session context
2. **Taskmaster (Claude)**: For AI task orchestration and fallback processing
3. **MagicUI**: For UI component templates and design system
4. **Memory**: For caching API responses and session data
5. **Knowledge**: For Bible reference information and resources
6. **GitHub MCP**: For repository management and CI/CD

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- Google account with access to Google Sheets API
- API keys for:
  - OpenRouter
  - Pexels

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bible-study-tracker.git
   cd bible-study-tracker
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Create a `.env` file in the backend directory based on `.env.example`
   - Create a `.env.local` file in the frontend directory based on `.env.local.example`

5. Set up Google Sheets:
   - Create a Google Sheet with the required columns
   - Set up Google API credentials and save as `credentials.json` in the backend directory

### Running the Application

1. Start the backend:
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python app.py
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Start MCP servers:
   ```bash
   npm run start:mcp-servers
   ```

4. Open your browser and navigate to `http://localhost:3000`

## MCP Server Integration

### Context7

Used for:
- Storing user preferences
- Managing session context
- Tracking user interaction patterns

### Taskmaster (Claude)

Used for:
- Orchestrating AI processing tasks
- Managing fallback processing when primary AI fails
- Scheduling and monitoring automated tasks

### MagicUI

Used for:
- Providing UI component templates
- Managing design system
- Generating responsive layouts

### Memory

Used for:
- Caching API responses
- Storing session data for quick retrieval
- Managing temporary storage for processing

### Knowledge

Used for:
- Providing Bible reference information
- Storing and retrieving resource links
- Managing cross-references

### GitHub MCP

Used for:
- Managing repository and version control
- Automating CI/CD pipeline
- Tracking issues and feature requests

## Logging and Debugging

The application includes comprehensive logging:

- **Backend Logging**: Structured JSON logs with different levels (DEBUG, INFO, ERROR)
- **Frontend Logging**: Console logs and error boundaries
- **MCP Server Logging**: Detailed logs for all MCP server interactions

Log files are stored in the `logs` directory and rotated daily.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenRouter for providing AI capabilities
- Pexels for image resources
- Google for Sheets API
- All MCP server providers for enhanced functionality
