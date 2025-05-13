#!/usr/bin/env python3
"""
Script to create a verse overlay on an image without darkening the entire image
"""

import os
import sys
import json
import requests
import io
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

def create_verse_overlay(image_path, output_path, text_lines, style="elegant"):
    """
    Create a verse overlay on an image without darkening the entire image
    
    Args:
        image_path (str): Path or URL of the image to use as background
        output_path (str): Path to save the output image
        text_lines (list): List of dictionaries with text and style
                          [{"text": "Text", "style": "normal|highlight|reference"}]
        style (str): Style of the graphic (elegant, bold, etc.)
        
    Returns:
        str: Path to the saved image
    """
    try:
        print(f"Creating verse overlay with {len(text_lines)} text lines")
        
        # Load the image (from URL or local path)
        if image_path.startswith(('http://', 'https://')):
            response = requests.get(image_path, timeout=10)
            img = Image.open(io.BytesIO(response.content))
        else:
            img = Image.open(image_path)
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize image if needed (keeping aspect ratio)
        max_width = 1200
        max_height = 800
        if img.width > max_width or img.height > max_height:
            img.thumbnail((max_width, max_height), Image.LANCZOS)
        
        # Create a drawing context
        draw = ImageDraw.Draw(img)
        
        # Try to load fonts based on style
        try:
            # For the elegant style
            if style == "elegant":
                # For normal text - serif font
                normal_font = ImageFont.truetype("Times New Roman.ttf", 40) if os.name == 'nt' else ImageFont.truetype("Times New Roman", 40)
                
                # For highlighted text - script/handwriting font
                # Try different script fonts based on platform
                try:
                    if os.name == 'nt':  # Windows
                        highlight_font = ImageFont.truetype("Brush Script MT.ttf", 80)
                    else:  # macOS or Linux
                        highlight_font = ImageFont.truetype("Zapfino.ttf", 80)
                except:
                    # Fallback to a common script font
                    try:
                        highlight_font = ImageFont.truetype("Comic Sans MS.ttf", 80) if os.name == 'nt' else ImageFont.truetype("Comic Sans MS", 80)
                    except:
                        # Last resort fallback
                        highlight_font = normal_font
                
                # For reference - sans-serif font, all caps
                reference_font = ImageFont.truetype("Arial.ttf", 30) if os.name == 'nt' else ImageFont.truetype("Arial", 30)
            else:
                # Default fonts for other styles
                normal_font = ImageFont.truetype("Arial.ttf", 40) if os.name == 'nt' else ImageFont.truetype("Arial", 40)
                highlight_font = ImageFont.truetype("Arial Bold.ttf", 60) if os.name == 'nt' else ImageFont.truetype("Arial Bold", 60)
                reference_font = ImageFont.truetype("Arial.ttf", 30) if os.name == 'nt' else ImageFont.truetype("Arial", 30)
        except Exception as e:
            print(f"Could not load font: {e}, using default")
            normal_font = ImageFont.load_default()
            highlight_font = ImageFont.load_default()
            reference_font = ImageFont.load_default()
        
        # Calculate total text height to center vertically
        total_text_height = 0
        line_spacing = 20  # Space between lines
        
        for line in text_lines:
            if line["style"] == "highlight":
                font = highlight_font
                line_height = 90  # Taller for script font
            elif line["style"] == "reference":
                font = reference_font
                line_height = 40
            else:  # normal
                font = normal_font
                line_height = 50
            
            total_text_height += line_height
        
        # Add spacing between lines
        total_text_height += line_spacing * (len(text_lines) - 1)
        
        # Calculate starting Y position to center text vertically
        text_y = (img.height - total_text_height) / 2
        
        # Draw each line of text with a subtle shadow for readability
        for line in text_lines:
            text = line["text"]
            line_style = line["style"]
            
            # Select font based on style
            if line_style == "highlight":
                font = highlight_font
                line_height = 90
                text_color = (255, 255, 255)  # White for highlighted text
            elif line_style == "reference":
                font = reference_font
                line_height = 40
                # Convert to uppercase for reference
                text = text.upper()
                text_color = (255, 255, 255)  # White for reference
            else:  # normal
                font = normal_font
                line_height = 50
                text_color = (255, 255, 255)  # White for normal text
            
            # Calculate text width to center horizontally
            text_width = draw.textlength(text, font=font)
            text_x = (img.width - text_width) / 2
            
            # Draw text shadow for better readability
            shadow_offset = 2
            shadow_color = (0, 0, 0, 180)
            
            # Draw shadow
            draw.text((text_x + shadow_offset, text_y + shadow_offset), 
                     text, font=font, fill=shadow_color)
            
            # Draw text
            draw.text((text_x, text_y), text, font=font, fill=text_color)
            
            # Move to next line position
            text_y += line_height + line_spacing
        
        # Save the image with high quality
        img.save(output_path, quality=95)
        print(f"Image saved to: {output_path}")
        
        return output_path
    
    except Exception as e:
        print(f"Error creating verse overlay: {e}")
        raise

def main():
    """Main function to run the script"""
    # Setting up the text layout for Romans 9:30
    romans_text_lines = [
        {"text": "What shall we say, then?", "style": "normal"},
        {"text": "That Gentiles who did not pursue righteousness", "style": "highlight"},
        {"text": "have attained it, that is,", "style": "normal"},
        {"text": "a righteousness that is by faith.", "style": "normal"},
        {"text": "Romans 9:30", "style": "reference"}
    ]
    
    # Image URL - using a beautiful image that represents the Bible study theme
    # This is a placeholder - we'll search for a better image related to the Bible study
    image_url = "https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg"
    
    # Determine output paths
    desktop_path = os.path.join(os.path.expanduser('~'), 'Desktop')
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Create the Romans verse image
    romans_filename = f"romans_9_30_{timestamp}.jpg"
    romans_output_path = os.path.join(desktop_path, romans_filename)
    create_verse_overlay(image_url, romans_output_path, romans_text_lines, style="elegant")
    
    # Also save a copy in the project directory
    project_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    romans_project_output_path = os.path.join(project_dir, "verse-image.jpg")
    
    # Copy the file to the project directory
    import shutil
    shutil.copy2(romans_output_path, romans_project_output_path)
    print(f"Romans verse image also saved to: {romans_project_output_path}")
    
    # Create a JSON file with the verse information
    verse_info = {
        "reference": "Romans 9:30",
        "text": "What shall we say, then? That Gentiles who did not pursue righteousness have attained it, that is, a righteousness that is by faith.",
        "image_path": romans_output_path,
        "project_image_path": romans_project_output_path
    }
    
    verse_info_path = os.path.join(project_dir, "verse-info.json")
    with open(verse_info_path, 'w') as f:
        json.dump(verse_info, f, indent=2)
    
    print(f"Verse information saved to: {verse_info_path}")
    
    return romans_output_path

if __name__ == "__main__":
    main()
