# Google Sheet to Google Doc Data Mapping

This document outlines the mapping of data from the Google Sheet to the sections of the automatically generated Google Doc newsletter.

## 1. Source Google Sheet

- **Sheet Name:** Bible Study Tracker
- **Tab Name:** Bible Studies

## 2. Relevant Google Sheet Columns

The following columns from the "Bible Studies" tab are relevant for generating the Google Doc. The trigger for document generation is when the "Ready?" column for a specific row is set to "ready".

| Column Name             | Data Type / Content                                     | Purpose in Doc Generation                     |
|-------------------------|---------------------------------------------------------|-----------------------------------------------|
| `Date`                  | Date                                                    | May be used for logging or context, not directly in current doc layout. |
| `Verses Covered`        | Text (e.g., "John 3:1-16")                            | Used as the Google Doc title and in the "Scripture(s) Covered" section. |
| `Picture`               | Text (Google Drive File ID of the generated image)      | Used to insert the image at the top of the Doc. |
| `Prayer Requests`       | Text (Manually entered or AI-generated)                 | Content for the "Prayer Requests" section.      |
| `Key verse of the Study`| Text (AI-generated key verse)                           | Content for the "Key Verse of the Study" section. |
| `Enhanced Meeting Summary` | Text (AI-generated summary of the study message)       | Content for the "Bible Study Message" section. |
| `Next Week Verses`      | Text (Manually entered or AI-generated)                 | Content for the "Looking Ahead" section.        |
| `AI Prayer Focus`       | Text (AI-generated prayer related to the study)         | Content for the "Prayer Focus" section.         |
| `Ready?`                | Text ("ready")                                          | Triggers the document generation process.     |

*Other columns like `Speaker`, `Transcript`, `Summaries`, `Key Takeaways`, `Discussion Questions` exist in the sheet and provide context for AI generation steps that populate the columns above, but are not directly mapped to the final Doc layout specified by the user for this task.*

## 3. Target Google Doc Structure and Mapping

A new Google Doc will be created for each Bible study session. The title of the Google Doc will be the content of the `Verses Covered` column.

The structure and content mapping are as follows:

1.  **Document Title:**
    *   **Source:** Google Sheet Column `Verses Covered`

2.  **Image Section (Top of Document):**
    *   **Content:** Image inserted from Google Drive.
    *   **Source:** Google Sheet Column `Picture` (This column contains the Google Drive File ID of the image).

3.  **Section: Prayer Requests**
    *   **Heading:** "Prayer Requests" (Formatted as bold)
    *   **Content:** Text content.
    *   **Source:** Google Sheet Column `Prayer Requests`.
    *   *Note: If this column is empty, a placeholder like "No specific prayer requests noted for this week." or similar could be used, or the section could be omitted based on preference.*

4.  **Section: Key Verse of the Study**
    *   **Heading:** "Key Verse of the Study" (Formatted as bold)
    *   **Content:** Text content (the key Bible verse).
    *   **Source:** Google Sheet Column `Key verse of the Study`.

5.  **Section: Scripture(s) Covered**
    *   **Heading:** "Scripture(s) Covered" (Formatted as bold)
    *   **Content:** Text content (listing the scriptures covered).
    *   **Source:** Google Sheet Column `Verses Covered`.

6.  **Section: Bible Study Message**
    *   **Heading:** "Bible Study Message" (Formatted as bold)
    *   **Content:** Text content (the main message or summary of the study).
    *   **Source:** Google Sheet Column `Enhanced Meeting Summary`.

7.  **Section: Looking Ahead**
    *   **Heading:** "Looking Ahead" (Formatted as bold)
    *   **Content:** Text content (details about the next week's study).
    *   **Source:** Google Sheet Column `Next Week Verses`.
    *   *Note: If this column is empty, a placeholder or omission could be considered.*

8.  **Section: Prayer Focus**
    *   **Heading:** "Prayer Focus" (Formatted as bold)
    *   **Content:** Text content (the AI-generated prayer).
    *   **Source:** Google Sheet Column `AI Prayer Focus`.

## 4. Formatting Notes

- All section headings are to be formatted in **bold**.
- Appropriate spacing (e.g., newlines) should be used between sections for readability.
- The overall document should aim for a "professionally formatted", "really clean", and "great" look, suitable for email insertion or sharing.

## 5. Pre-requisites for Data in Google Sheet

For the Google Doc generation to work correctly, the following columns in the Google Sheet must be populated *before* the "Ready?" column is marked as "ready":

- `Verses Covered`
- `Picture` (with a valid Google Drive File ID of an accessible image)
- `Key verse of the Study`
- `Enhanced Meeting Summary`
- `AI Prayer Focus`
- `Prayer Requests` (if this section is desired and not to be a placeholder)
- `Next Week Verses` (if this section is desired and not to be a placeholder)

This mapping will guide the design of the Google Doc template and the automation script.
