const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const epub = require('epub-gen');
const readline = require('readline');
const { exit } = require('process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to ask for input and validate numbers
const askForNumber = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (input) => {
            if (input.toLowerCase() === 'exit') {
                console.log("Exiting the program...");
                rl.close();
                process.exit();
            }

            const number = parseInt(input);
            if (!isNaN(number)) {
                resolve(number);
            } else {
                console.log("Please enter a valid number or type 'exit' to quit.");
                resolve(askForNumber(question)); // Recurse until valid input is given
            }
        });
    });
};

// Helper function to ask for string input and validate non-whitespace input
const askForString = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (input) => {
            if (input.toLowerCase() === 'exit') {
                console.log("Exiting the program...");
                rl.close();
                process.exit();
            }

            if (input.trim().length === 0) {
                console.log("Input cannot be empty. Please try again.");
                resolve(askForString(question)); // Recurse until valid input is given
            } else {
                resolve(input);
            }
        });
    });
};

// Function to fetch and scrape a chapter with retry mechanism
async function scrapeChapter(chapterNumber, retries = 5) {
    const url = `https://www.lightnovelworld.co/novel/shadow-slave-1365/chapter-${chapterNumber}`;

    try {
        console.log(`Starting to scrape Chapter ${chapterNumber}...`);

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data);

        const chapterTitle = $('h1 .chapter-title').text().trim();
        const chapterContent = $('#chapter-container').html().trim();

        console.log(`Successfully scraped Chapter ${chapterNumber}`);

        return { title: chapterTitle, content: chapterContent };
    } catch (error) {
        if (retries > 0) {
            console.log(`Error scraping Chapter ${chapterNumber}. Retrying... Remaining retries: ${retries}`);
            return await scrapeChapter(chapterNumber, retries - 1);
        } else {
            console.error(`Error scraping Chapter ${chapterNumber}:`, error.message);
            return null;
        }
    }
}

// Function to scrape a range of chapters and return content for the EPUB
async function scrapeChapterRange(startChapter, endChapter) {
    let chapters = [];
    let failedChapters = [];

    for (let i = startChapter; i <= endChapter; i++) {
        const chapterData = await scrapeChapter(i);
        if (chapterData) {
            chapters.push(chapterData);
        } else {
            failedChapters.push(i);
        }
    }

    return { chapters, failedChapters };
}

// Function to create EPUB file from scraped chapters
async function createEpub(chapters, outputFileName, volumeNumber, customTitle, seriesName, authorName) {
    // Dynamically create the folder name for the series
    const seriesFolderName = seriesName.replace(/\s+/g, '_') + '_EPUB';  // Replacing spaces with underscores
    const outputFolder = path.join(__dirname, seriesFolderName);  // Folder path where EPUB will be saved

    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true }); // Create the folder if it doesn't exist
    }

    const dynamicTitle = `${seriesName} Volume ${volumeNumber}: ${customTitle}`;
    const outputFilePath = path.join(outputFolder, outputFileName);

    const coverImagePath = path.join(__dirname, 'img', 'Shadowslave.jpg');

    const options = {
        title: dynamicTitle,
        author: authorName,
        content: chapters.map((chapter) => ({
            title: chapter.title,
            data: chapter.content
        })),
        output: outputFilePath,
        cover: coverImagePath,
    };

    try {
        await new epub(options).promise;
        console.log(`EPUB saved to: ${outputFilePath}`);
    } catch (error) {
        console.error('Error generating EPUB:', error.message);
    }
}

// Function to confirm user input before proceeding
const confirmAction = (message) => {
    return new Promise((resolve) => {
        rl.question(`${message} (y/n): `, (input) => {
            if (input.toLowerCase() === 'exit') {
                console.log("Exiting the program...");
                rl.close();
                process.exit();
            }

            if (input.toLowerCase() === 'y') {
                resolve(true);
            } else if (input.toLowerCase() === 'n') {
                resolve(false);
            } else {
                console.log("Invalid input. Please type 'y' for yes or 'n' for no.");
                resolve(confirmAction(message)); // Recurse if invalid input
            }
        });
    });
};

// Function to scrape multiple volumes
async function scrapeMultipleVolumes(startVolume, endVolume, seriesName, authorName) {
    const volumes = [];
    const volumeStatus = []; // To track the status of each volume

    for (let volumeNumber = startVolume; volumeNumber <= endVolume; volumeNumber++) {
        const customTitle = await askForString(`Enter the custom title for Volume ${volumeNumber}: `);

        const startChapter = await askForNumber(`Enter the starting chapter number for Volume ${volumeNumber}: `);
        const endChapter = await askForNumber(`Enter the ending chapter number for Volume ${volumeNumber}: `);

        const confirmation = await confirmAction(
            `You entered the following for Volume ${volumeNumber}:\nTitle: ${customTitle}\nStart Chapter: ${startChapter}\nEnd Chapter: ${endChapter}\nIs this correct?`
        );

        if (confirmation) {
            volumes.push({ volumeNumber, customTitle, startChapter, endChapter });
        } else {
            console.log("Let's try again with the correct information.");
            volumeNumber--; // Re-ask for the same volume
        }

        console.log("\n=====================\n"); // Add a break between volumes
    }

    // Scrape all volumes
    for (const { volumeNumber, customTitle, startChapter, endChapter } of volumes) {
        const outputFileName = `shadow_slave_volume_${volumeNumber}`;
        console.log(`Scraping chapters ${startChapter} to ${endChapter} for Volume ${volumeNumber}...\n`);

        const { chapters, failedChapters } = await scrapeChapterRange(startChapter, endChapter);

        if (chapters.length > 0) {
            console.log(`\nFound ${chapters.length} chapters for Volume ${volumeNumber}. Creating EPUB...`);
            await createEpub(chapters, `${outputFileName}.epub`, volumeNumber, customTitle, seriesName, authorName);
        }

        if (failedChapters.length === 0) {
            console.log(`All chapters of Volume ${volumeNumber} successfully scraped.\n`);
            volumeStatus.push({ volumeNumber, status: "success" });
        } else {
            console.log(`Unable to scrape the following chapters of Volume ${volumeNumber}: ${failedChapters.join(', ')}\n`);
            volumeStatus.push({ volumeNumber, status: "failed", failedChapters });
        }

        console.log("=================================\n"); // Add a break between volumes
    }

    // Display summary
    console.log("\nSummary of Scraping Results:");
    let allSuccess = true;
    for (const status of volumeStatus) {
        if (status.status === "failed") {
            allSuccess = false;
            console.log(`Volume ${status.volumeNumber}: Failed chapters - ${status.failedChapters.join(", ")}`);
        } else {
            console.log(`Volume ${status.volumeNumber}: Successfully scraped`);
        }
    }

    if (allSuccess) {
        console.log("\nAll volumes successfully scraped!");
    }

    return volumeStatus;
}

// Main program starts here
async function main() {
    console.log("=========================================");
    console.log("Welcome to the Scraper!");
    console.log("Type 'exit' at any time to exit the program.");
    console.log("=========================================\n");

    const seriesName = await askForString('Enter the series name: ');  // Ask for the series name
    const authorName = await askForString('Enter the author name: ');  // Ask for the author name

    const startVolume = await askForNumber('Enter the starting volume number: ');
    const endVolume = await askForNumber('Enter the ending volume number: ');

    const confirmation = await confirmAction(
        `You entered the following volume range:\nStart Volume: ${startVolume}\nEnd Volume: ${endVolume}\nSeries: ${seriesName}\nAuthor: ${authorName}\nIs this correct?`
    );

    if (confirmation) {
        console.log(`Gathering information for volumes ${startVolume} to ${endVolume} of ${seriesName}...\n`);
        const status = await scrapeMultipleVolumes(startVolume, endVolume, seriesName, authorName);

        // Ask if the user wants to run the program again
        const runAgain = await confirmAction("Do you want to run the program again?");
        if (runAgain) {
            console.log("\nRestarting the program...\n");
            await main(); // Call main again to restart
        } else {
            console.log("Exiting the program...");
            rl.close();
            process.exit();
        }
    } else {
        console.log("Exiting the program. Please run again with the correct inputs.");
        rl.close();
        process.exit();
    }
}

main();
