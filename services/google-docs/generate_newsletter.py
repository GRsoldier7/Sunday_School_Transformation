#!/usr/bin/env python3
"""
Script to generate a Google Doc newsletter from Bible Study Google Sheet data
following the specified template design.
"""

import os
import sys
import json
from datetime import datetime
from googleapiclient.discovery import build
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import pickle

# If modifying these scopes, delete the file token.pickle.
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',  # Full access to spreadsheets
    'https://www.googleapis.com/auth/documents',     # Full access to documents
    'https://www.googleapis.com/auth/drive'          # Full access to drive
]

def get_credentials():
    """Get and return the credentials needed to access Google APIs."""
    creds = None
    # The file token.pickle stores the user's access and refresh tokens
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)

    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Try to use service account if credentials.json exists
            if os.path.exists('credentials.json'):
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            # Otherwise, try to use service account
            elif os.path.exists(os.environ.get('GOOGLE_SHEETS_SERVICE_ACCOUNT_PATH', '')):
                creds = service_account.Credentials.from_service_account_file(
                    os.environ.get('GOOGLE_SHEETS_SERVICE_ACCOUNT_PATH', ''),
                    scopes=SCOPES
                )
            # Try the n8n service account as a fallback
            elif os.path.exists('./services/google-sheets/n8n-integrations-452015-4b872fccca7e.json'):
                creds = service_account.Credentials.from_service_account_file(
                    './services/google-sheets/n8n-integrations-452015-4b872fccca7e.json',
                    scopes=SCOPES
                )
            else:
                raise Exception("No credentials found. Please set up credentials.json or service account.")

        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    return creds

def get_sheet_data(spreadsheet_id, range_name):
    """Get data from the Google Sheet."""
    creds = get_credentials()
    service = build('sheets', 'v4', credentials=creds)

    # Call the Sheets API
    sheet = service.spreadsheets()
    result = sheet.values().get(
        spreadsheetId=spreadsheet_id,
        range=range_name
    ).execute()

    values = result.get('values', [])

    if not values:
        print('No data found in the sheet.')
        return None

    # Get headers from the first row
    headers = values[0]

    # Convert the data to a list of dictionaries
    data = []
    for row in values[1:]:
        # Pad the row with empty strings if it's shorter than headers
        padded_row = row + [''] * (len(headers) - len(row))
        data.append(dict(zip(headers, padded_row)))

    return data

def create_document(title):
    """Create a new Google Doc with the given title."""
    creds = get_credentials()
    docs_service = build('docs', 'v1', credentials=creds)

    # Create a new document
    document = docs_service.documents().create(body={
        'title': title
    }).execute()

    print(f"Created document with title: {title}")
    print(f"Document ID: {document.get('documentId')}")

    return document.get('documentId')

def create_or_use_tab_in_document(doc_id, tab_title):
    """Create a new tab in an existing Google Doc or use an existing tab."""
    creds = get_credentials()
    docs_service = build('docs', 'v1', credentials=creds)
    drive_service = build('drive', 'v3', credentials=creds)

    # First, check if the document exists
    try:
        document = docs_service.documents().get(documentId=doc_id).execute()
        print(f"Found document with title: {document.get('title')}")
    except Exception as e:
        print(f"Error finding document: {e}")
        return None

    # Check if a tab with this title already exists
    try:
        # Get the current document's properties
        file = drive_service.files().get(fileId=doc_id, fields='properties').execute()
        properties = file.get('properties', {})
        tabs = properties.get('tabs', [])

        # Look for an existing tab with the same title
        for tab in tabs:
            if tab.get('title') == tab_title:
                print(f"Found existing tab '{tab_title}' in document")
                tab_doc_id = tab.get('documentId')

                # Check if we can access this document
                try:
                    tab_doc = docs_service.documents().get(documentId=tab_doc_id).execute()
                    print(f"Successfully accessed existing tab document: {tab_doc.get('title')}")
                    return tab_doc_id
                except Exception as e:
                    print(f"Error accessing existing tab document: {e}")
                    print("Creating a new tab document instead...")
                    break

        # If we get here, no existing tab was found or accessible, so create a new one
        print(f"No existing tab found with title '{tab_title}', creating new tab...")
    except Exception as e:
        print(f"Error checking for existing tabs: {e}")
        print("Continuing with creating a new tab...")

    # Create a new document for the tab content
    tab_doc = docs_service.documents().create(body={
        'title': tab_title
    }).execute()
    tab_doc_id = tab_doc.get('documentId')
    print(f"Created tab document with title: {tab_title}")
    print(f"Tab Document ID: {tab_doc_id}")

    # Share the document with anyone who has the link
    try:
        drive_service.permissions().create(
            fileId=tab_doc_id,
            body={
                'type': 'anyone',
                'role': 'writer',
                'allowFileDiscovery': False
            }
        ).execute()
        print(f"Shared tab document with anyone who has the link")
    except Exception as e:
        print(f"Error sharing tab document: {e}")

    # Now we need to add this as a tab to the main document
    # This requires using the Drive API to update the document's properties
    try:
        # First, get the current document's properties again (in case they changed)
        file = drive_service.files().get(fileId=doc_id, fields='properties').execute()

        # Update the properties to include the new tab
        properties = file.get('properties', {})
        tabs = properties.get('tabs', [])

        # Remove any existing tab with the same title
        tabs = [tab for tab in tabs if tab.get('title') != tab_title]

        # Add the new tab
        tabs.append({
            'title': tab_title,
            'documentId': tab_doc_id
        })
        properties['tabs'] = tabs

        # Update the document with the new properties
        drive_service.files().update(
            fileId=doc_id,
            body={'properties': properties}
        ).execute()

        print(f"Added tab '{tab_title}' to document")
        return tab_doc_id
    except Exception as e:
        print(f"Error adding tab to document: {e}")
        print("Continuing with standalone document...")
        return tab_doc_id

def insert_image(doc_id, image_id):
    """Insert an image from Google Drive into the document."""
    creds = get_credentials()
    docs_service = build('docs', 'v1', credentials=creds)

    # Get the document to find the end index
    document = docs_service.documents().get(documentId=doc_id).execute()
    end_index = document.get('body').get('content')[-1].get('endIndex')

    # Insert the image
    requests = [
        {
            'insertInlineImage': {
                'location': {
                    'index': end_index - 1
                },
                'uri': f'https://drive.google.com/uc?id={image_id}',
                'objectSize': {
                    'width': {
                        'magnitude': 500,
                        'unit': 'PT'
                    }
                }
            }
        }
    ]

    docs_service.documents().batchUpdate(
        documentId=doc_id,
        body={'requests': requests}
    ).execute()

    print(f"Inserted image with ID: {image_id}")

def format_document(doc_id, data):
    """Format the document according to the template design."""
    creds = get_credentials()
    docs_service = build('docs', 'v1', credentials=creds)

    # Get the document to find the end index
    document = docs_service.documents().get(documentId=doc_id).execute()
    end_index = document.get('body').get('content')[-1].get('endIndex')

    # Clear the document content if it's not empty
    if end_index > 1:
        print(f"Clearing existing content in document {doc_id}...")
        try:
            docs_service.documents().batchUpdate(
                documentId=doc_id,
                body={
                    'requests': [
                        {
                            'deleteContentRange': {
                                'range': {
                                    'startIndex': 1,
                                    'endIndex': end_index - 1
                                }
                            }
                        }
                    ]
                }
            ).execute()
            print("Document content cleared successfully")
        except Exception as e:
            print(f"Error clearing document content: {e}")
            print("Continuing with existing content...")

    # Get the document again to find the new end index
    document = docs_service.documents().get(documentId=doc_id).execute()
    end_index = document.get('body').get('content')[-1].get('endIndex')

    # Prepare the content for the document
    requests = []

    # Add the title
    requests.append({
        'insertText': {
            'location': {
                'index': 1
            },
            'text': data.get('Verses Covered', 'Bible Study')
        }
    })

    # Format the title
    requests.extend([
        # Format the title
        {
            'updateParagraphStyle': {
                'range': {
                    'startIndex': 1,
                    'endIndex': 1 + len(data.get('Verses Covered', 'Bible Study'))
                },
                'paragraphStyle': {
                    'alignment': 'CENTER',
                    'lineSpacing': 115,
                    'spaceAbove': {
                        'magnitude': 0,
                        'unit': 'PT'
                    },
                    'spaceBelow': {
                        'magnitude': 20,
                        'unit': 'PT'
                    }
                },
                'fields': 'alignment,lineSpacing,spaceAbove,spaceBelow'
            }
        },
        {
            'updateTextStyle': {
                'range': {
                    'startIndex': 1,
                    'endIndex': 1 + len(data.get('Verses Covered', 'Bible Study'))
                },
                'textStyle': {
                    'fontSize': {
                        'magnitude': 18,
                        'unit': 'PT'
                    },
                    'weightedFontFamily': {
                        'fontFamily': 'Arial'
                    },
                    'bold': True
                },
                'fields': 'fontSize,weightedFontFamily,bold'
            }
        }
    ])

    # Add a newline after the title
    requests.append({
        'insertText': {
            'location': {
                'index': end_index - 1
            },
            'text': '\n\n'
        }
    })

    # Add sections
    sections = [
        {'heading': 'Prayer Requests', 'content': data.get('Prayer Requests', 'No specific prayer requests noted for this week.')},
        {'heading': 'Key Verse of the Study', 'content': data.get('Key verse of the Study', '')},
        {'heading': 'Scripture(s) Covered', 'content': data.get('Verses Covered', '')},
        {'heading': 'Bible Study Message', 'content': data.get('AI Meeting Summary', '')},  # Using AI Meeting Summary column
        {'heading': 'Looking Ahead', 'content': data.get('Next Week Verses', 'To be updated.')},
        {'heading': 'Prayer Focus', 'content': data.get('AI Prayer Focus', '')}
    ]

    for section in sections:
        # Skip empty sections
        if not section['content']:
            continue

        # Add section heading
        requests.append({
            'insertText': {
                'location': {
                    'index': end_index - 1
                },
                'text': f"{section['heading']}\n"
            }
        })

        # Format section heading
        requests.append({
            'updateParagraphStyle': {
                'range': {
                    'startIndex': end_index - 1,
                    'endIndex': end_index - 1 + len(section['heading']) + 1
                },
                'paragraphStyle': {
                    'alignment': 'START',
                    'spaceAbove': {
                        'magnitude': 20,
                        'unit': 'PT'
                    },
                    'spaceBelow': {
                        'magnitude': 10,
                        'unit': 'PT'
                    }
                },
                'fields': 'alignment,spaceAbove,spaceBelow'
            }
        })

        requests.append({
            'updateTextStyle': {
                'range': {
                    'startIndex': end_index - 1,
                    'endIndex': end_index - 1 + len(section['heading'])
                },
                'textStyle': {
                    'fontSize': {
                        'magnitude': 14,
                        'unit': 'PT'
                    },
                    'weightedFontFamily': {
                        'fontFamily': 'Arial'
                    },
                    'bold': True
                },
                'fields': 'fontSize,weightedFontFamily,bold'
            }
        })

        # Add section content
        requests.append({
            'insertText': {
                'location': {
                    'index': end_index - 1 + len(section['heading']) + 1
                },
                'text': f"{section['content']}\n\n"
            }
        })

        # Format section content
        requests.append({
            'updateTextStyle': {
                'range': {
                    'startIndex': end_index - 1 + len(section['heading']) + 1,
                    'endIndex': end_index - 1 + len(section['heading']) + 1 + len(section['content'])
                },
                'textStyle': {
                    'fontSize': {
                        'magnitude': 11,
                        'unit': 'PT'
                    },
                    'weightedFontFamily': {
                        'fontFamily': 'Arial'
                    }
                },
                'fields': 'fontSize,weightedFontFamily'
            }
        })

        # Update end_index for the next section
        end_index += len(section['heading']) + 1 + len(section['content']) + 2

    # Apply all the formatting
    docs_service.documents().batchUpdate(
        documentId=doc_id,
        body={'requests': requests}
    ).execute()

    print("Document formatted according to template design")

def generate_newsletter(spreadsheet_id, row_index, target_doc_id=None):
    """Generate a newsletter document from the specified row in the Google Sheet."""
    # Get the data from the Google Sheet
    data = get_sheet_data(spreadsheet_id, 'Bible Studies!A1:Z')

    if not data or row_index >= len(data):
        print(f"No data found for row index {row_index}")
        return

    row_data = data[row_index]

    # Check if the row is ready for document generation
    ready_status = row_data.get('Ready?', '').upper()
    if ready_status != 'READY':
        print(f"Row {row_index + 1} is not ready for document generation (status: {ready_status})")
        return

    # Get the title from the Verses Covered column
    title = row_data.get('Verses Covered', f'Bible Study - {datetime.now().strftime("%Y-%m-%d")}')

    # If a target document ID is provided, create or use a tab in that document
    if target_doc_id:
        doc_id = create_or_use_tab_in_document(target_doc_id, title)
        if not doc_id:
            print(f"Failed to create or use tab in document {target_doc_id}")
            print("Creating standalone document instead...")
            doc_id = create_document(title)
    else:
        # Create a new standalone document
        doc_id = create_document(title)

    # Insert the image if available
    image_id = row_data.get('Picture', '')
    if image_id and not image_id.startswith('http'):
        try:
            insert_image(doc_id, image_id)
        except Exception as e:
            print(f"Error inserting image: {e}")
            print("Continuing without image...")

    # Format the document according to the template design
    format_document(doc_id, row_data)

    print(f"Newsletter document generated successfully: https://docs.google.com/document/d/{doc_id}/edit")
    return doc_id

def update_existing_tab(doc_id, data):
    """Update an existing tab document with the newsletter content."""
    creds = get_credentials()
    docs_service = build('docs', 'v1', credentials=creds)

    # Get the document to find the end index
    try:
        document = docs_service.documents().get(documentId=doc_id).execute()
        print(f"Successfully accessed document: {document.get('title')}")

        # Clear the document content
        end_index = document.get('body').get('content')[-1].get('endIndex')
        if end_index > 1:
            print(f"Clearing existing content in document {doc_id}...")
            try:
                docs_service.documents().batchUpdate(
                    documentId=doc_id,
                    body={
                        'requests': [
                            {
                                'deleteContentRange': {
                                    'range': {
                                        'startIndex': 1,
                                        'endIndex': end_index - 1
                                    }
                                }
                            }
                        ]
                    }
                ).execute()
                print("Document content cleared successfully")
            except Exception as e:
                print(f"Error clearing document content: {e}")
                print("Continuing with existing content...")

        # Format the document with the newsletter content
        format_document(doc_id, data)
        print(f"Updated existing tab document: https://docs.google.com/document/d/{doc_id}/edit")
        return True
    except Exception as e:
        print(f"Error accessing or updating document: {e}")
        return False

def main():
    """Main function to run the script."""
    # Get the spreadsheet ID from environment variable
    spreadsheet_id = os.environ.get('GOOGLE_SHEETS_SPREADSHEET_ID')
    if not spreadsheet_id:
        print("GOOGLE_SHEETS_SPREADSHEET_ID environment variable not set")
        sys.exit(1)

    # Get the target document ID (the document where tabs will be created)
    target_doc_id = "1kchm4o3FMugKpgBTfedjrPND44Mz0W4y2e0wabCnwEo"  # The specified Google Doc

    # Get the row index from command line argument or default to 0 (row 1)
    row_index = int(sys.argv[1]) if len(sys.argv) > 1 else 0

    # Get the data from the Google Sheet
    data = get_sheet_data(spreadsheet_id, 'Bible Studies!A1:Z')

    if not data or row_index >= len(data):
        print(f"No data found for row index {row_index}")
        sys.exit(1)

    row_data = data[row_index]

    # Check if the row is ready for document generation
    ready_status = row_data.get('Ready?', '').upper()
    if ready_status != 'READY':
        print(f"Row {row_index + 1} is not ready for document generation (status: {ready_status})")
        sys.exit(1)

    # Get the title from the Verses Covered column
    title = row_data.get('Verses Covered', f'Bible Study - {datetime.now().strftime("%Y-%m-%d")}')

    # Try to directly update the existing tab document
    existing_tab_id = "1ajkbv0t3Ri6igCKBtR1H_0KGzc-HQCjICszJAfGqhSc"  # The ID of the existing tab document

    if update_existing_tab(existing_tab_id, row_data):
        print(f"Successfully updated existing tab document for '{title}'")
    else:
        print(f"Failed to update existing tab document, generating newsletter normally...")
        generate_newsletter(spreadsheet_id, row_index, target_doc_id)

if __name__ == "__main__":
    main()
