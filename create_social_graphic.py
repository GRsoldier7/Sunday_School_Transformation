# create_social_graphic.py

from PIL import Image, ImageDraw, ImageFont
import os
import sys # Added for exit()

def draw_text_lines(draw, text_lines, image_width, image_height, fonts):
    line_spacing = 10
    current_y = image_height // 3

    total_text_block_height = 0
    for i, line in enumerate(text_lines):
        text = line["text"]
        style = line["style"]
        font = fonts.get(style, fonts["normal"])
        # Use textbbox for more accurate size if available, otherwise textsize
        if hasattr(draw, "textbbox"):
            bbox = draw.textbbox((0,0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        else:
            text_width, text_height = draw.textsize(text, font=font)
        total_text_block_height += text_height
        if i < len(text_lines) - 1:
            total_text_block_height += line_spacing

    current_y = (image_height - total_text_block_height) // 2
    if current_y < image_height // 10:
        current_y = image_height // 10

    for line in text_lines:
        text = line["text"]
        style = line["style"]

        font = fonts.get(style, fonts["normal"])
        if hasattr(draw, "textbbox"):
            bbox = draw.textbbox((0,0), text, font=font)
            text_width = bbox[2] - bbox[0]
            # text_height is already calculated above for block height, can reuse or recalc
        else:
            text_width, _ = draw.textsize(text, font=font)

        x = (image_width - text_width) // 2

        # Get individual line height for advancing y
        if hasattr(draw, "textbbox"):
            bbox_line = draw.textbbox((0,0), text, font=font)
            line_height = bbox_line[3] - bbox_line[1]
        else:
            _, line_height = draw.textsize(text, font=font)

        draw.text((x, current_y), text, font=font, fill="white")
        current_y += line_height + line_spacing

def load_fonts(style_name, base_path="fonts"):
    fonts = {}
    if not os.path.isdir(base_path):
        print(f"Warning: Font directory 	{base_path}	 not found. Text may not render correctly.")
        try:
            fonts["normal"] = ImageFont.truetype("arial.ttf", 48)
            fonts["highlight"] = ImageFont.truetype("arialbd.ttf", 60)
            fonts["reference"] = ImageFont.truetype("arial.ttf", 36)
            print("Warning: Using fallback system Arial fonts.")
            return fonts
        except IOError:
            raise RuntimeError(f"Font directory 	{base_path}	 not found and fallback system fonts failed to load.")

    font_files = {
        "elegant": {
            "normal": "Sacramento-Regular.ttf",
            "highlight": "SeaportScript-Regular.otf",
            "reference": "DMSans-Regular.ttf"
        },
        "modern": {
            "normal": "RedHatDisplay-Regular.ttf",
            "highlight": "TiltWarp-Regular.ttf",
            "reference": "DMSans-Regular.ttf"
        },
        "bold": {
            "normal": "Arial_Bold.ttf", # Example, Apple.ttf is not standard
            "highlight": "Impact.ttf",   # Example, Strike.ttf is not standard
            "reference": "DMSans-Bold.ttf"
        }
    }

    font_sizes = {
        "elegant": {"normal": 72, "highlight": 90, "reference": 48},
        "modern": {"normal": 48, "highlight": 56, "reference": 36},
        "bold": {"normal": 48, "highlight": 56, "reference": 36}
    }

    if style_name not in font_files:
        raise ValueError("Unknown style: " + style_name)

    current_style_files = font_files[style_name]
    current_style_sizes = font_sizes[style_name]

    for key, font_file_name in current_style_files.items():
        font_path = os.path.join(base_path, font_file_name)
        try:
            fonts[key] = ImageFont.truetype(font_path, current_style_sizes[key])
        except IOError as e:
            print(f"Error loading font 	{font_file_name}	 for style 	{style_name}	 from 	{font_path}	: {e}")
            raise
    return fonts

if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description='Create a social graphic with verse overlay')
    parser.add_argument('image_path', help='Path to the input image')
    parser.add_argument('output_path', help='Path to save the output image')
    parser.add_argument('--text-lines', help='JSON string of text lines or path to JSON file')
    parser.add_argument('--style', default='elegant', help='Style to use (elegant, modern, bold)')
    parser.add_argument('--font-dir', default='fonts', help='Directory containing fonts')

    args = parser.parse_args()

    image_path_arg = args.image_path
    output_path_arg = args.output_path
    style_arg = args.style
    font_dir_arg = args.font_dir

    # Default text lines if not provided
    default_text_lines = [
        {"text": "In the beginning", "style": "normal"},
        {"text": "was the Word,", "style": "highlight"},
        {"text": "and the Word was with God,", "style": "normal"},
        {"text": "and the Word was God.", "style": "normal"},
        {"text": "John 1:1", "style": "reference"}
    ]

    # Parse text lines from argument or use default
    if args.text_lines:
        try:
            # Check if it's a file path
            if os.path.isfile(args.text_lines):
                with open(args.text_lines, 'r') as f:
                    text_lines_arg = json.load(f)
            else:
                # Try to parse as JSON string
                text_lines_arg = json.loads(args.text_lines)
        except Exception as e:
            print(f"Error parsing text lines: {e}")
            print("Using default text lines instead.")
            text_lines_arg = default_text_lines
    else:
        # Try to load from verse-info.json if it exists
        if os.path.isfile('verse-info.json'):
            try:
                with open('verse-info.json', 'r') as f:
                    verse_info = json.load(f)
                    reference = verse_info.get('reference', 'John 1:1')
                    text = verse_info.get('text', 'In the beginning was the Word, and the Word was with God, and the Word was God.')

                    # Split the text into lines
                    words = text.split()
                    if len(words) <= 5:
                        # Short verse, just use two lines
                        text_lines_arg = [
                            {"text": " ".join(words), "style": "highlight"},
                            {"text": reference, "style": "reference"}
                        ]
                    else:
                        # Longer verse, split into multiple lines
                        third = len(words) // 3
                        text_lines_arg = [
                            {"text": " ".join(words[:third]), "style": "normal"},
                            {"text": " ".join(words[third:2*third]), "style": "highlight"},
                            {"text": " ".join(words[2*third:]), "style": "normal"},
                            {"text": reference, "style": "reference"}
                        ]
            except Exception as e:
                print(f"Error loading verse-info.json: {e}")
                print("Using default text lines instead.")
                text_lines_arg = default_text_lines
        else:
            text_lines_arg = default_text_lines

    if not os.path.exists(image_path_arg):
        print(f"Error: Input image 	{image_path_arg}	 not found!")
        sys.exit(1)

    if not os.path.isdir(font_dir_arg):
        print(f"Error: Font directory 	{font_dir_arg}	 not found!")
        sys.exit(1)

    try:
        fonts_loaded = load_fonts(style_arg, base_path=font_dir_arg)
    except Exception as e:
        print(f"Error loading fonts: {e}")
        sys.exit(1)

    try:
        image = Image.open(image_path_arg).convert("RGBA")
    except Exception as e:
        print(f"Error opening image 	{image_path_arg}	: {e}")
        sys.exit(1)

    # Darken the background for better text visibility
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 160))  # semi-transparent black
    image = Image.alpha_composite(image, overlay)

    draw = ImageDraw.Draw(image)

    draw_text_lines(draw, text_lines_arg, image.width, image.height, fonts_loaded)

    try:
        image.convert("RGB").save(output_path_arg)
        print(f"Image saved to: 	{output_path_arg}")
    except Exception as e:
        print(f"Error saving image to 	{output_path_arg}	: {e}")
        sys.exit(1)

