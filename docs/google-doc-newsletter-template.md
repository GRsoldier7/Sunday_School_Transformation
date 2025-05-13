# Google Doc Newsletter Template Design

This document outlines the design for the professionally formatted Google Doc newsletter to be generated from the Bible Study Google Sheet data.

## 1. Overall Document Principles

- **Clean and Professional:** The design will prioritize readability and a polished look, suitable for sharing or embedding in an email.
- **Consistent Formatting:** Uniform styling will be applied to headings, body text, and spacing throughout the document.
- **Clear Hierarchy:** Visual cues (font size, weight, spacing) will guide the reader through the different sections.
- **API-Achievable:** The design will be mindful of what can be programmatically achieved with the Google Docs API.

## 2. Document Title

- **Content:** Derived from the `Verses Covered` column in the Google Sheet.
- **Formatting:**
    - **Font:** Arial (or a similar clean, sans-serif default Google Docs font).
    - **Size:** 18pt (or a suitable large heading size).
    - **Weight:** Bold.
    - **Alignment:** Centered.
    - **Spacing:** Significant space below before the first section (e.g., 2-3 blank lines or equivalent paragraph spacing).

## 3. Image Section (Top of Document)

- **Content:** The image whose Google Drive File ID is in the `Picture` column.
- **Placement:** Immediately below the Document Title.
- **Formatting:**
    - **Alignment:** Centered on the page.
    - **Sizing:** The image should be scaled to fit within the page margins while maintaining its aspect ratio. A maximum width (e.g., 90% of page width) could be considered to ensure it doesn't overwhelm the page. The Google Docs API allows specifying width and height; if only one is specified, aspect ratio is usually maintained.
    - **Spacing:** A clear visual break (e.g., 1-2 blank lines or paragraph spacing) between the image and the first text section.

## 4. Section Headings

Applies to: "Prayer Requests", "Key Verse of the Study", "Scripture(s) Covered", "Bible Study Message", "Looking Ahead", "Prayer Focus".

- **Formatting:**
    - **Font:** Arial (or the same sans-serif font as the body text).
    - **Size:** 14pt (or a size clearly larger than body text but smaller than the main title).
    - **Weight:** Bold.
    - **Alignment:** Left-aligned.
    - **Spacing:**
        - Space above the heading (to separate it from the previous section): e.g., 1 blank line or equivalent paragraph spacing.
        - Space below the heading (before the content of the section): e.g., 0.5 blank lines or smaller paragraph spacing.

## 5. Body Text (Content within Sections)

Applies to the text content under each section heading.

- **Formatting:**
    - **Font:** Arial (or a similar clean, readable sans-serif default Google Docs font).
    - **Size:** 11pt or 12pt (standard body text size).
    - **Weight:** Regular.
    - **Alignment:** Left-aligned.
    - **Line Spacing:** 1.15 or 1.5 for readability.
    - **Paragraph Spacing:** Small space after paragraphs (e.g., 6pt-8pt) to distinguish them without requiring double line breaks manually.

## 6. Specific Section Content Notes

- **Prayer Requests, Looking Ahead:** If the source Google Sheet column is empty, the script should either insert a placeholder text (e.g., "To be updated.", "No specific requests this week.") or omit the section entirely (user preference to be confirmed, but omitting might be cleaner if consistently empty). For now, assume placeholder text if empty.
- **Key Verse of the Study:** The verse text itself.
- **Scripture(s) Covered:** The list of scriptures.
- **Bible Study Message:** The summary text.
- **Prayer Focus:** The AI-generated prayer text.

## 7. Page Setup (Assumed Google Docs Defaults)

- **Paper Size:** Letter (8.5" x 11") or A4, depending on typical Google Docs defaults for the user's region.
- **Margins:** Standard Google Docs margins (e.g., 1 inch on all sides).
- **Orientation:** Portrait.

## 8. Example Flow (Conceptual)

```
[CENTERED, BOLD, 18pt TITLE - e.g., John 3:1-16]

[SPACE]

[CENTERED IMAGE - Scaled appropriately]

[SPACE]

**Prayer Requests** (Bold, 14pt)
[Body text, 11pt, 1.15 line spacing]
[Content from sheet or placeholder]

[SPACE]

**Key Verse of the Study** (Bold, 14pt)
[Body text, 11pt, 1.15 line spacing]
[Content from sheet]

[SPACE]

**Scripture(s) Covered** (Bold, 14pt)
[Body text, 11pt, 1.15 line spacing]
[Content from sheet]

[SPACE]

**Bible Study Message** (Bold, 14pt)
[Body text, 11pt, 1.15 line spacing]
[Content from sheet]

[SPACE]

**Looking Ahead** (Bold, 14pt)
[Body text, 11pt, 1.15 line spacing]
[Content from sheet or placeholder]

[SPACE]

**Prayer Focus** (Bold, 14pt)
[Body text, 11pt, 1.15 line spacing]
[Content from sheet]
```

## 9. Future Considerations / Flexibility

- **Font Customization:** While Arial is suggested for simplicity and wide availability, the script should be structured so that font names and sizes can be easily changed via variables if the user later desires specific fonts (assuming they are available to the Google Docs API environment or can be specified).
- **Color:** No specific colors are included in this initial design to maintain simplicity and professionalism. Color could be added later for headings or accents if desired.
- **Advanced Layout:** This design uses a simple linear flow. More complex layouts (e.g., multi-column) would significantly increase the complexity of API calls and are not included for this MVP.
