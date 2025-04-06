# Light Novel World Scraper

A Node.js-based web scraper for extracting chapters from lightnovelworld.co and converting them into EPUB format.

## Description

**Light Novel World Scraper** is a tool designed to scrape chapters from the **Light Novel World** website (lightnovelworld.co) and generate an **EPUB** file for offline reading. The scraper can fetch a range of chapters from any light novel and format them into a neat, readable EPUB file.

The program allows the user to customize the title for each volume, specify chapter ranges, and automatically generates the EPUB file for each volume.

## Features

- Scrape a range of chapters from Light Novel World.
- Convert the chapters into a well-formatted EPUB file.
- Retry mechanism in case of errors.
- Customizable volume titles and metadata.
- Easy-to-use command-line interface.

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
    The scraper requires an image (for the EPUB cover). Ensure you have a folder named `img/` in your project directory and place a cover image (e.g., `Shadowslave.jpg`) in it.

## Usage

To run the scraper, use the following command:

```bash
node scraper.js
```

The program will prompt you to enter the following:

1. **Volume Information**:
    - The volume number (e.g., Volume 1, Volume 2).
    - The custom title for the volume.

2. **Chapter Range**:
    - The start and end chapter numbers for the volume.

3. **EPUB Generation**:
    - After scraping the chapters, the program will automatically generate an EPUB file for the specified volume range.

The generated EPUB file will be saved in a folder named `Shadow_Slave_Volumes_EPUB`.

## Contributing

Contributions are welcome! Feel free to fork the repository, make changes, and create pull requests. Here are a few things you can help with:

- Improving the scraper logic (handling edge cases).
- Adding more features like scraping other websites.
- Writing tests and documentation.

