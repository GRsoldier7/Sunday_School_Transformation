# fetch_unsplash_image.py
import requests
import os
import json
import sys
import argparse

# Default API key - should be moved to .env file in production
UNSPLASH_ACCESS_KEY = os.environ.get("UNSPLASH_ACCESS_KEY", "OraoC-OUIJwz6lp24FC20w_DAEDIthJvnbvJVhLkBWM")
DEFAULT_SEARCH_QUERY = "Love Grace Peace King of Kings"

def fetch_images(search_query, num_images=3, output_dir="."):
    url = "https://api.unsplash.com/search/photos"
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}",
        "Accept-Version": "v1"
    }
    params = {
        "query": search_query,
        "per_page": num_images + 10,  # Fetch more to increase chances of finding suitable ones
        "orientation": "portrait",
        "content_filter": "high"
    }
    downloaded_paths = []

    try:
        print(f"Searching Unsplash for: 	{search_query}	")
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        if data["results"]:
            count = 0
            for i, img_data in enumerate(data["results"]):
                if count >= num_images:
                    break

                image_id = img_data.get("id", "unknown_id")
                description = img_data.get("description", "") or "" # Ensure string, handle None then empty
                alt_description = img_data.get("alt_description", "") or "" # Ensure string
                tags_data = img_data.get("tags", [])
                tags = [tag.get("title", "") for tag in tags_data if isinstance(tag, dict)]

                print(f"\nImage candidate {i+1} (ID: {image_id}):")
                print(f"  Description: 	{description}")
                print(f"  Alt Description: 	{alt_description}")
                print(f"  Tags: 	{tags}")

                skip_keywords = ["text", "sign", "typography", "letter", "word", "words", "banner", "quote", "model", "person", "people", "man", "woman", "child", "font", "writing"]
                contains_skip_keyword = False
                # Check description, alt_description, and tags for skip_keywords
                combined_text_to_check = f"{description.lower()} {alt_description.lower()} {' '.join(tags).lower()}"

                for keyword in skip_keywords:
                    if keyword in combined_text_to_check:
                        print(f"  Skipping image {image_id} due to keyword: 	{keyword}")
                        contains_skip_keyword = True
                        break

                if contains_skip_keyword:
                    continue

                image_url = img_data.get("urls", {}).get("regular")
                if not image_url:
                    print(f"  Skipping image {image_id} due to missing regular URL.")
                    continue

                output_path = os.path.join(output_dir, f"unsplash_image_{image_id}_{count + 1}.jpg")

                print(f"  Downloading image {count + 1} from: {image_url}")
                image_response = requests.get(image_url, stream=True)
                image_response.raise_for_status()

                with open(output_path, "wb") as f:
                    for chunk in image_response.iter_content(chunk_size=8192):
                        f.write(chunk)
                print(f"  Image {count + 1} successfully downloaded to {output_path}")
                downloaded_paths.append(output_path)
                count += 1

            if not downloaded_paths:
                print("No suitable images found after filtering. You might need to adjust keywords or filtering logic, or the API returned no results matching criteria.")
            return downloaded_paths
        else:
            print(f"No images found for the query: 	{search_query}")
            return []

    except requests.exceptions.RequestException as e:
        print(f"Error fetching image from Unsplash: {e}")
        if hasattr(e, 'response') and e.response is not None:
            try:
                print(f"Response content: {e.response.json()}")
            except json.JSONDecodeError:
                print(f"Response content: {e.response.text}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return []

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Fetch images from Unsplash')
    parser.add_argument('--query', default=DEFAULT_SEARCH_QUERY, help='Search query for Unsplash')
    parser.add_argument('--num-images', type=int, default=3, help='Number of images to fetch')
    parser.add_argument('--output-dir', default='.', help='Directory to save images')

    args = parser.parse_args()

    fetched_image_paths = fetch_images(args.query, num_images=args.num_images, output_dir=args.output_dir)
    if fetched_image_paths:
        print("\nSuccessfully downloaded images:")
        for path in fetched_image_paths:
            print(path)
    else:
        print("\nFailed to download any suitable images.")

