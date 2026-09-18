# Open GitHub EPG (AvelixTV Global)

This repository automatically scrapes and generates a massive, global TV guide (EPG) across 21 different languages using a Parallel Matrix strategy on GitHub Actions.

## How It Works
Every day at midnight (UTC), GitHub Actions automatically boots up 21 parallel servers. 
Each server grabs a specific language (e.g., English, Russian, Urdu) for the next 24 hours (1 day).
Once all servers finish, a custom NodeJS script automatically merges all the chunks into a single `global-epg.xml` file.

## 🚀 Laptop Setup (Automatic Sync)
If you clone or download this repository to your laptop, it is already 100% configured!
To test or update the EPG manually on GitHub:
1. Go to the **Actions** tab on GitHub.
2. Click **Global EPG Scraper**.
3. Click the **Run workflow** button.

## Accessing the EPG in your App
Your app should download the EPG directly from this raw URL:
`https://raw.githubusercontent.com/tayyabtest1-beep/open-github-epg/main/global-epg.xml`

## Important Note on Speed & Limits
Because the `en` (English) list is massive (over 50,000 channels), the grabber has been optimized to only pull **1 Day** of data (`--days 1`) and use **20 Max Connections**. This ensures it finishes well within the 6-hour GitHub Actions limit without getting stuck or running out of memory.
