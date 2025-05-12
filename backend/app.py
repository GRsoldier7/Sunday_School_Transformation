"""
Bible Study Tracker API

This is the main Flask application for the Bible Study Tracker API.
It provides endpoints for managing sessions, generating images, and triggering emails.
"""

import os
import time
import json
import io
import base64
from datetime import datetime
from functools import wraps

from flask import Flask, request, jsonify, g
from flask_cors import CORS
import requests
from PIL import Image, ImageDraw, ImageFont
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.auth.exceptions import RefreshError

# Import custom modules
from utils.config import config
from utils.logger import app_logger, api_logger, pexels_logger, sheets_logger, log_request, log_response, log_exception, log_api_call
from services.mcp_services import mcp_services

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=config.CORS_ORIGINS)

# Google Sheets API scopes
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# Middleware to log requests and responses
@app.before_request
def before_request():
    """Log request and set start time"""
    g.start_time = time.time()
    log_request(request)

@app.after_request
def after_request(response):
    """Log response with duration"""
    if hasattr(g, 'start_time'):
        duration = time.time() - g.start_time
        log_response(response, duration)
    return response

# Error handler
@app.errorhandler(Exception)
def handle_exception(e):
    """Global exception handler"""
    log_exception(e)
    return jsonify({"error": str(e)}), 500

# Helper decorator for API endpoints
def api_endpoint(f):
    """Decorator for API endpoints with error handling"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            log_exception(e)
            return jsonify({"error": str(e)}), 500
    return decorated

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    # Check MCP services health
    mcp_status = {}
    for name, service in mcp_services.items():
        mcp_status[name] = {
            "enabled": service.is_enabled(),
            "healthy": service.check_health() if service.is_enabled() else False
        }

    return jsonify({
        "status": "ok",
        "message": "Bible Study Tracker API is running",
        "timestamp": datetime.now().isoformat(),
        "mcp_services": mcp_status
    })

@app.route('/api/sessions', methods=['GET'])
@api_endpoint
def get_sessions():
    """Get all sessions from Google Sheets"""
    # Try to get from Memory MCP service first
    if mcp_services['memory'].is_enabled():
        cached_sessions = mcp_services['memory'].retrieve('sessions')
        if cached_sessions:
            app_logger.info("Retrieved sessions from Memory MCP service")
            return jsonify({"sessions": cached_sessions})

    # Get credentials and build service
    creds = get_credentials()
    service = build('sheets', 'v4', credentials=creds)

    # Call the Sheets API
    sheet = service.spreadsheets()
    result = sheet.values().get(
        spreadsheetId=config.GOOGLE_SHEETS_ID,
        range='Sessions!A2:Z'
    ).execute()

    values = result.get('values', [])

    if not values:
        return jsonify({"sessions": []})

    # Convert to list of dictionaries
    headers = ['id', 'date', 'scripture', 'transcription', 'plaudSynopsis',
              'prayerRequests', 'keyVerse', 'imageQuery', 'imageUrl',
              'aiSummary', 'enhancedCommentary', 'nextSessionPreview',
              'emailStatus', 'emailSentTimestamp', 'errorLog']

    sessions = []
    for i, row in enumerate(values):
        session = {"id": i + 1}
        for j, value in enumerate(row):
            if j < len(headers):
                session[headers[j]] = value
        sessions.append(session)

    # Cache in Memory MCP service
    if mcp_services['memory'].is_enabled():
        mcp_services['memory'].store('sessions', sessions, 300)  # Cache for 5 minutes

    return jsonify({"sessions": sessions})

@app.route('/api/sessions/<int:session_id>', methods=['GET'])
@api_endpoint
def get_session(session_id):
    """Get a specific session from Google Sheets"""
    # Try to get from Memory MCP service first
    if mcp_services['memory'].is_enabled():
        cached_session = mcp_services['memory'].retrieve(f'session_{session_id}')
        if cached_session:
            app_logger.info(f"Retrieved session {session_id} from Memory MCP service")
            return jsonify({"session": cached_session})

    # Get credentials and build service
    creds = get_credentials()
    service = build('sheets', 'v4', credentials=creds)

    # Call the Sheets API
    sheet = service.spreadsheets()
    result = sheet.values().get(
        spreadsheetId=config.GOOGLE_SHEETS_ID,
        range=f'Sessions!A{session_id + 1}:Z{session_id + 1}'
    ).execute()

    values = result.get('values', [])

    if not values:
        return jsonify({"error": "Session not found"}), 404

    # Convert to dictionary
    headers = ['id', 'date', 'scripture', 'transcription', 'plaudSynopsis',
              'prayerRequests', 'keyVerse', 'imageQuery', 'imageUrl',
              'aiSummary', 'enhancedCommentary', 'nextSessionPreview',
              'emailStatus', 'emailSentTimestamp', 'errorLog']

    session = {"id": session_id}
    for j, value in enumerate(values[0]):
        if j < len(headers):
            session[headers[j]] = value

    # Get additional context from Context7 if available
    if mcp_services['context7'].is_enabled():
        context = mcp_services['context7'].get_context(str(session_id), ['session'])
        if context:
            session['context'] = context

    # Get Bible reference information from Knowledge MCP if available
    if mcp_services['knowledge'].is_enabled() and 'scripture' in session:
        bible_info = mcp_services['knowledge'].get_bible_reference(session['scripture'])
        if bible_info:
            session['bibleInfo'] = bible_info

    # Cache in Memory MCP service
    if mcp_services['memory'].is_enabled():
        mcp_services['memory'].store(f'session_{session_id}', session, 300)  # Cache for 5 minutes

    return jsonify({"session": session})

@app.route('/api/generate-image', methods=['POST'])
@api_endpoint
def generate_image():
    """Generate a verse image using Pexels API and Pillow"""
    data = request.json
    verse_text = data.get('verse_text')
    search_query = data.get('search_query')
    session_id = data.get('session_id')

    if not verse_text or not search_query:
        return jsonify({"error": "Verse text and search query are required"}), 400

    # Get image from Pexels
    image_url = get_pexels_image(search_query)

    if not image_url:
        return jsonify({"error": "Failed to get image from Pexels"}), 500

    # Generate verse image
    verse_image_base64 = create_verse_image(image_url, verse_text)

    # Update Google Sheet with image URL
    if session_id:
        update_image_url(session_id, verse_image_base64)

        # Store in Context7 if enabled
        if mcp_services['context7'].is_enabled():
            mcp_services['context7'].store_context(
                str(session_id),
                {
                    'imageGenerated': True,
                    'imageGeneratedAt': datetime.now().isoformat(),
                    'imageQuery': search_query
                },
                ['session', 'image']
            )

        # Invalidate cache in Memory MCP
        if mcp_services['memory'].is_enabled():
            mcp_services['memory'].store(f'session_{session_id}', None, 1)  # Expire immediately
            mcp_services['memory'].store('sessions', None, 1)  # Expire immediately

    return jsonify({
        "image_url": verse_image_base64,
        "message": "Image generated successfully"
    })

@app.route('/api/generate-ai-content', methods=['POST'])
@api_endpoint
def generate_ai_content():
    """Generate AI content for a session using Taskmaster or OpenRouter"""
    data = request.json
    session = data.get('session')

    if not session:
        return jsonify({"error": "Session data is required"}), 400

    scripture = session.get('scripture', '')
    transcription = session.get('transcription', '')
    plaud_synopsis = session.get('plaudSynopsis', '')

    if not scripture or not transcription or not plaud_synopsis:
        return jsonify({
            "error": "Scripture, transcription, and PLAUD synopsis are required"
        }), 400

    # Try to use Taskmaster MCP service if enabled
    if mcp_services['taskmaster'].is_enabled():
        ai_content = mcp_services['taskmaster'].generate_ai_content(
            scripture, transcription, plaud_synopsis
        )

        if ai_content:
            # Update Google Sheet with AI content
            if 'id' in session:
                update_ai_content(
                    session['id'],
                    ai_content.get('summary', ''),
                    ai_content.get('commentary', ''),
                    ai_content.get('nextSessionPreview', '')
                )

            return jsonify(ai_content)

    # Fallback to direct OpenRouter API calls
    # (This would be implemented in a real application)

    # For now, return mock data
    mock_content = {
        "summary": "This is a mock AI summary for " + scripture,
        "commentary": "This is a mock enhanced commentary for " + scripture,
        "nextSessionPreview": "This is a mock next session preview based on " + scripture
    }

    # Update Google Sheet with mock content
    if 'id' in session:
        update_ai_content(
            session['id'],
            mock_content['summary'],
            mock_content['commentary'],
            mock_content['nextSessionPreview']
        )

    return jsonify(mock_content)

@app.route('/api/trigger-email/<int:session_id>', methods=['POST'])
@api_endpoint
def trigger_email(session_id):
    """Trigger email sending for a session"""
    # Try to use Taskmaster MCP service if enabled
    if mcp_services['taskmaster'].is_enabled():
        success = mcp_services['taskmaster'].schedule_email_digest(session_id)
        if success:
            return jsonify({
                "message": "Email sending scheduled with Taskmaster",
                "session_id": session_id
            })

    # Fallback to Google Sheets trigger
    # Get credentials and build service
    creds = get_credentials()
    service = build('sheets', 'v4', credentials=creds)

    # Update the email status to trigger Google Apps Script
    sheet = service.spreadsheets()
    sheet.values().update(
        spreadsheetId=config.GOOGLE_SHEETS_ID,
        range=f'Sessions!M{session_id + 1}',
        valueInputOption='RAW',
        body={'values': [['Send Now']]}
    ).execute()

    # Invalidate cache in Memory MCP
    if mcp_services['memory'].is_enabled():
        mcp_services['memory'].store(f'session_{session_id}', None, 1)  # Expire immediately
        mcp_services['memory'].store('sessions', None, 1)  # Expire immediately

    return jsonify({
        "message": "Email sending triggered successfully",
        "session_id": session_id
    })

@app.route('/api/mcp-status', methods=['GET'])
def mcp_status():
    """Get status of all MCP services"""
    status = {}
    for name, service in mcp_services.items():
        status[name] = {
            "enabled": service.is_enabled(),
            "healthy": service.check_health() if service.is_enabled() else False
        }

    return jsonify({"mcp_services": status})

# Helper functions
def get_credentials():
    """Get Google API credentials"""
    creds = None
    token_path = 'token.json'
    credentials_path = config.GOOGLE_CREDENTIALS_PATH

    # Check if token.json exists
    if os.path.exists(token_path):
        try:
            creds = Credentials.from_authorized_user_info(
                json.loads(open(token_path).read()), SCOPES)
        except Exception as e:
            sheets_logger.error(f"Error loading token.json: {str(e)}")
            if os.path.exists(token_path):
                os.remove(token_path)

    # If credentials don't exist or are invalid, get new ones
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except RefreshError as e:
                sheets_logger.error(f"Error refreshing token: {str(e)}")
                if os.path.exists(token_path):
                    os.remove(token_path)
                flow = InstalledAppFlow.from_client_secrets_file(
                    credentials_path, SCOPES)
                creds = flow.run_local_server(port=0)
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)

        # Save the credentials for the next run
        with open(token_path, 'w') as token:
            token.write(creds.to_json())

    return creds

def get_pexels_image(query):
    """Get an image URL from Pexels API"""
    start_time = time.time()

    headers = {
        'Authorization': config.PEXELS_API_KEY
    }

    url = f'https://api.pexels.com/v1/search?query={query}&per_page=1'

    try:
        response = requests.get(url, headers=headers, timeout=10)
        duration = time.time() - start_time

        if response.status_code == 200:
            data = response.json()
            if data['photos']:
                image_url = data['photos'][0]['src']['large']

                log_api_call(
                    'pexels',
                    'search',
                    params={'query': query},
                    success=True,
                    response={'image_url': image_url},
                    duration=duration,
                    logger=pexels_logger
                )

                return image_url

        log_api_call(
            'pexels',
            'search',
            params={'query': query},
            success=False,
            error=f"Status code: {response.status_code}, Response: {response.text}",
            duration=duration,
            logger=pexels_logger
        )

        return None
    except Exception as e:
        log_api_call(
            'pexels',
            'search',
            params={'query': query},
            success=False,
            error=e,
            logger=pexels_logger
        )

        return None

def create_verse_image(image_url, verse_text):
    """Create a verse image using Pillow"""
    try:
        # Download the image
        response = requests.get(image_url, timeout=10)
        img = Image.open(io.BytesIO(response.content))

        # Resize image if needed
        max_size = (1200, 800)
        img.thumbnail(max_size, Image.LANCZOS)

        # Create a semi-transparent overlay
        overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        # Add a semi-transparent rectangle
        rect_coords = (50, 50, img.width - 50, img.height - 50)
        draw.rectangle(rect_coords, fill=(0, 0, 0, 128))

        # Add the verse text
        try:
            font = ImageFont.truetype("Arial.ttf", 36)
        except IOError:
            font = ImageFont.load_default()

        # Wrap text
        max_width = img.width - 200
        lines = []
        words = verse_text.split()
        current_line = words[0]

        for word in words[1:]:
            test_line = current_line + " " + word
            text_width = draw.textlength(test_line, font=font)

            if text_width <= max_width:
                current_line = test_line
            else:
                lines.append(current_line)
                current_line = word

        lines.append(current_line)

        # Calculate text position
        text_height = len(lines) * 50
        text_y = (img.height - text_height) // 2

        # Draw text
        for line in lines:
            text_width = draw.textlength(line, font=font)
            text_x = (img.width - text_width) // 2
            draw.text((text_x, text_y), line, font=font, fill=(255, 255, 255, 255))
            text_y += 50

        # Combine the original image with the overlay
        img = img.convert('RGBA')
        result = Image.alpha_composite(img, overlay)
        result = result.convert('RGB')

        # Convert to base64
        buffer = io.BytesIO()
        result.save(buffer, format='JPEG')
        img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')

        return f"data:image/jpeg;base64,{img_str}"
    except Exception as e:
        app_logger.error(f"Error creating verse image: {str(e)}")
        raise

def update_image_url(session_id, image_url):
    """Update the image URL in Google Sheets"""
    try:
        # Get credentials and build service
        creds = get_credentials()
        service = build('sheets', 'v4', credentials=creds)

        # Update the image URL
        sheet = service.spreadsheets()
        sheet.values().update(
            spreadsheetId=config.GOOGLE_SHEETS_ID,
            range=f'Sessions!I{session_id + 1}',
            valueInputOption='RAW',
            body={'values': [[image_url]]}
        ).execute()

        sheets_logger.info(f"Updated image URL for session {session_id}")
        return True
    except Exception as e:
        sheets_logger.error(f"Error updating image URL for session {session_id}: {str(e)}")
        raise

def update_ai_content(session_id, summary, commentary, next_session_preview):
    """Update AI content in Google Sheets"""
    try:
        # Get credentials and build service
        creds = get_credentials()
        service = build('sheets', 'v4', credentials=creds)

        # Update the AI content
        sheet = service.spreadsheets()
        sheet.values().update(
            spreadsheetId=config.GOOGLE_SHEETS_ID,
            range=f'Sessions!J{session_id + 1}:L{session_id + 1}',
            valueInputOption='RAW',
            body={'values': [[summary, commentary, next_session_preview]]}
        ).execute()

        # Update the email status
        sheet.values().update(
            spreadsheetId=config.GOOGLE_SHEETS_ID,
            range=f'Sessions!M{session_id + 1}',
            valueInputOption='RAW',
            body={'values': [['AI Complete']]}
        ).execute()

        sheets_logger.info(f"Updated AI content for session {session_id}")
        return True
    except Exception as e:
        sheets_logger.error(f"Error updating AI content for session {session_id}: {str(e)}")
        raise

if __name__ == '__main__':
    # Validate configuration
    missing_config = config.validate()
    if missing_config:
        app_logger.warning(f"Missing configuration: {', '.join(missing_config)}")

    # Log startup information
    app_logger.info(f"Starting Bible Study Tracker API in {config.ENV} mode")
    app_logger.info(f"Debug mode: {config.DEBUG}")

    # Check MCP services
    for name, service in mcp_services.items():
        if service.is_enabled():
            healthy = service.check_health()
            app_logger.info(f"MCP Service {name}: {'Healthy' if healthy else 'Unhealthy'}")
        else:
            app_logger.info(f"MCP Service {name}: Disabled")

    # Start the Flask app
    app.run(debug=config.DEBUG, port=config.PORT)
