# Light Novel World Scraper

A Node.js-based web scraper for extracting chapters from **lightnovelworld.co** and converting them into **EPUB** format.
---
*Disclaimer: This is purely for educational purposes only.*
---
## Description

**Light Novel World Scraper** is a tool designed to scrape chapters from the **Light Novel World** website (lightnovelworld.co) and generate a well-structured **EPUB** file for offline reading. The scraper allows you to fetch a range of chapters from any light novel, customize volume titles, choose cover images, and format everything into a neatly packaged EPUB file.

## Features

- Scrape a range of chapters from **Light Novel World**.
- Convert the scraped chapters into a well-formatted **EPUB** file.
- Retry mechanism in case of errors during scraping.
- Customizable volume titles, series name, author name, and metadata.
- Choose a cover image for each volume or use a single cover image for all volumes.
- User-friendly, command-line interface with prompts for easy input.
- Supports scraping multiple volumes at once.

## Installation

To install and run this project, follow the steps below:

### Prerequisites

Make sure you have **Node.js** installed. You can check if Node.js is installed by running the following command in your terminal:

```bash
node -v
```

If it's not installed, download and install it from [nodejs.org](https://nodejs.org/).

### Steps

1. **Clone the repository**:
    ```bash
    git clone https://github.com/Jairus-M8/light-novel-world-scraper.git
    ```

2. **Navigate to the project directory**:
    ```bash
    cd light-novel-world-scraper
    ```

3. **Install the required dependencies**:
    Run the following command to install all the necessary npm packages:
    ```bash
    npm install
    ```

4. **Setup**:
    - The scraper requires images for the EPUB cover. Ensure you have a folder named `img/` in your project directory and place a cover image (e.g., `Shadowslave.jpg`) in it. The scraper will prompt you to select an image during the process.

## Usage

To run the scraper, use the following command:

```bash
node scraper.js
```

The program will prompt you for the following information:

1. **Series URL**:
    - Paste a valid **Light Novel World** URL for any chapter in the series. The program will automatically extract the **series slug** from the URL to scrape multiple chapters.

    **Valid URL Examples:**
    - `https://www.lightnovelworld.co/novel/{series-name}-{series-id}/chapter-{chapter-id}`
    - `https://www.lightnovelworld.co/novel/the-beginning-after-the-end-548/chapter-6-16091352`
    - `https://www.lightnovelworld.co/novel/lord-of-the-mysteries-275/chapter-1103`

2. **Volume Information**:
    - Series title
    - Author
    - The volume number (e.g., Volume 1, Volume 2).

3. **Chapter Range**:
    - The start and end chapter numbers for the volume.

4. **Cover Image**:
    - Select a cover image for the volume. You can either use the same cover image for all volumes or choose a different image for each volume.

5. **EPUB Generation**:
    - After scraping the chapters, the program will automatically generate an EPUB file for the specified volume range.

The generated EPUB files will be saved in a folder named based on the series name, for example, `Series_Name_Here_EPUB/`.

### Example Flow:
1. Enter the **series URL** (the scraper will extract the **series slug**).
2. Enter the **series name** and **author name**.
3. Choose the **starting and ending volume numbers**.
4. For each volume:
   - Enter the **custom title** and **chapter range**.
   - Choose the **cover image** for that volume (or use the same cover for all volumes).
5. The scraper will fetch the chapters and create an EPUB for each volume.
6. The output will be saved in a folder named after the series, such as `Series_Name_Here_EPUB/`.

## Folder Structure

- `img/`: Folder containing the cover image(s) for the EPUB.
- `scraper.js`: Main script for scraping and generating the EPUB file.
- `Series_Name_Here_EPUB/`: Folder where the generated EPUB files will be saved (named based on the series).

### Example of Folder Structure:

```
/light-novel-world-scraper
  /img
    - Shadowslave.jpg (cover image for EPUB)
  /Series_Name_Here_EPUB
    - series_name_volume_1.epub
    - series_name_volume_2.epub
  scraper.js
  package.json
  README.md
```
## Contributing

Contributions are welcome! Feel free to fork the repository, make changes, and create pull requests. Here are a few things you can help with:

- Improving the scraper logic (handling edge cases).
- Adding more features, such as scraping other websites.
- Writing tests and documentation.

## 📚 Libraries Used

This project utilizes the following open-source libraries and core Node.js modules:

- [`axios`](https://www.npmjs.com/package/axios) – For making HTTP requests to fetch web page content.
- [`cheerio`](https://www.npmjs.com/package/cheerio) – For parsing and traversing HTML content using a jQuery-like syntax.
- [`epub-gen`](https://www.npmjs.com/package/epub-gen) – For generating EPUB files from scraped content.
- [`fs`](https://nodejs.org/api/fs.html) – Node.js file system module for reading and writing files.
- [`path`](https://nodejs.org/api/path.html) – Node.js utility for handling file and directory paths.
- [`readline`](https://nodejs.org/api/readline.html) – Node.js module for reading user input from the command line.
- [`process`](https://nodejs.org/api/process.html) – Provides information and control over the current Node.js process.
