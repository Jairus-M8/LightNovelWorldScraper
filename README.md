# Light Novel World Scraper

A Node.js-based web scraper for extracting chapters from lightnovelworld.co and converting them into EPUB format.

## Description

**Light Novel World Scraper** is a tool designed to scrape chapters from the **Light Novel World** website (lightnovelworld.co) and generate an **EPUB** file for offline reading. The scraper can fetch a range of chapters from any light novel and format them into a well-structured EPUB file. It also allows for customization of volume titles, cover images, and chapter ranges.

## Features

- Scrape a range of chapters from **Light Novel World**.
- Convert the scraped chapters into a well-formatted **EPUB** file.
- Retry mechanism in case of errors during scraping.
- Customizable volume titles, series name, author name, and metadata.
- Allows for selection of cover images for each volume or a single cover image for all volumes.
- User-friendly, command-line interface with prompts for easy input.
- Support for scraping multiple volumes at once.

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
    - The scraper requires images (for the EPUB cover). Ensure you have a folder named `img/` in your project directory and place a cover image (e.g., `Shadowslave.jpg`) in it. The scraper will prompt you to select an image during the process.

## Usage

To run the scraper, use the following command:

```bash
node scraper.js
```

The program will prompt you for the following information:

1. **Volume Information**:
    - The volume number (e.g., Volume 1, Volume 2).
    - The custom title for the volume.

2. **Chapter Range**:
    - The start and end chapter numbers for the volume.

3. **Cover Image**:
    - Select a cover image for the volume. You can either use the same cover image for all volumes or choose a different image for each volume.

4. **EPUB Generation**:
    - After scraping the chapters, the program will automatically generate an EPUB file for the specified volume range.
    
The generated EPUB files will be saved in a folder named `Shadow_Slave_Volumes_EPUB` (or a similarly named folder based on the series name).

### Example Flow:
1. Enter the **series name** and **author name**.
2. Choose the **starting and ending volume numbers**.
3. For each volume:
   - Enter the **custom title** and **chapter range**.
   - Choose the **cover image** for that volume (or use the same cover for all volumes).
4. The scraper will fetch the chapters and create an EPUB for each volume.
5. The output will be saved in a folder named based on the series name.

## Folder Structure

- `img/`: Folder containing the cover image(s).
- `scraper.js`: Main script for scraping and generating the EPUB file.
- `Series_Name_Here_EPUB/`: Folder where the generated EPUB files will be saved.

## Contributing

Contributions are welcome! Feel free to fork the repository, make changes, and create pull requests. Here are a few things you can help with:

- Improving the scraper logic (handling edge cases).
- Adding more features like scraping other websites.
- Writing tests and documentation.