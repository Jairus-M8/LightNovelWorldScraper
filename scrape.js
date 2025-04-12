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
async function scrapeChapter(chapterNumber, seriesSlug, retries = 5) {
    const url = `https://www.lightnovelworld.co/novel/${seriesSlug}/chapter-${chapterNumber}`;

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
            return await scrapeChapter(chapterNumber, seriesSlug, retries - 1);
        } else {
            console.error(`Error scraping Chapter ${chapterNumber}:`, error.message);
            return null;
        }
    }
}

// Function to scrape a range of chapters and return content for the EPUB
async function scrapeChapterRange(startChapter, endChapter, seriesSlug) {
    let chapters = [];
    let failedChapters = [];

    for (let i = startChapter; i <= endChapter; i++) {
        const chapterData = await scrapeChapter(i, seriesSlug);
        if (chapterData) {
            chapters.push(chapterData);
        } else {
            failedChapters.push(i);
        }
    }

    return { chapters, failedChapters };
}

// Function to get available images from the 'img' directory
function getImageFiles() {
    const imageFolderPath = path.join(__dirname, 'img');
    return fs.readdirSync(imageFolderPath).filter(file => {
        const extname = path.extname(file).toLowerCase();
        return extname === '.jpg' || extname === '.png' || extname === '.jpeg'; // Only accept image files
    });
}

// Function to select cover image for multiple volumes
async function chooseCoverImagesForVolumes(startVolume, endVolume) {
    const imageFiles = getImageFiles();
    if (imageFiles.length === 0) {
        console.log("No images found in the 'img' folder.");
        return null;
    }

    console.log("Available cover images:");
    imageFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
    });

    const coverImages = [];

    // Ask for the cover image for each volume before scraping
    for (let volumeNumber = startVolume; volumeNumber <= endVolume; volumeNumber++) {
        const choice = await askForString(`Enter the number of the cover image you want to use for Volume ${volumeNumber}, or type 'none' to skip: `);

        if (choice.toLowerCase() === 'none') {
            console.log(`Skipping cover image for Volume ${volumeNumber}.`);
            coverImages.push(null); // No cover image selected for this volume
        } else {
            const numberChoice = parseInt(choice);
            if (numberChoice >= 1 && numberChoice <= imageFiles.length) {
                const chosenImagePath = path.join(__dirname, 'img', imageFiles[numberChoice - 1]);
                coverImages.push(chosenImagePath); // Store the chosen image for this volume
            } else {
                console.log("Invalid choice. Please select a valid number or type 'none' to skip.");
                volumeNumber--; // Re-ask for the same volume
            }
        }
    }

    return coverImages;
}

// Function to select a cover image for a specific volume
async function chooseCoverImageForVolume(volumeNumber, skipCoverImageForAllVolumes) {
    if (skipCoverImageForAllVolumes) {
        console.log(`Skipping cover image for Volume ${volumeNumber}.`);
        return null; // No cover image selected for this volume
    }

    const imageFiles = getImageFiles();
    if (imageFiles.length === 0) {
        console.log("No images found in the 'img' folder.");
        return null;
    }

    console.log(`Available cover images for Volume ${volumeNumber}:`);
    imageFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
    });

    // Ask for the cover image for this volume or allow to skip by typing 'none'
    const choice = await askForString(`Enter the number of the cover image you want to use for Volume ${volumeNumber}, or type 'none' to skip: `);

    if (choice.toLowerCase() === 'none') {
        console.log(`Skipping cover image for Volume ${volumeNumber}.`);
        return null; // No cover image selected for this volume
    }

    const numberChoice = parseInt(choice);
    if (numberChoice >= 1 && numberChoice <= imageFiles.length) {
        const chosenImagePath = path.join(__dirname, 'img', imageFiles[numberChoice - 1]);
        return chosenImagePath;
    } else {
        console.log("Invalid choice. Please select a valid number or type 'none' to skip.");
        return chooseCoverImageForVolume(volumeNumber, skipCoverImageForAllVolumes); // Recursively ask for valid input
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

// Function to create EPUB file from scraped chapters
async function createEpub(chapters, outputFileName, volumeNumber, customTitle, seriesName, authorName, coverImagePath) {
    const seriesFolderName = seriesName.replace(/\s+/g, '_') + '_EPUB';
    const outputFolder = path.join(__dirname, seriesFolderName);

    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    const dynamicTitle = `${seriesName} Volume ${volumeNumber}: ${customTitle}`;
    const outputFilePath = path.join(outputFolder, outputFileName);

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

// Function to scrape multiple volumes
async function scrapeMultipleVolumes(startVolume, endVolume, seriesName, authorName, seriesSlug) {
    const volumes = [];
    const volumeStatus = [];

    // Ask for the cover image for each volume before scraping
    const coverImages = await chooseCoverImagesForVolumes(startVolume, endVolume);

    // First gather all volume information before scraping
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

        console.log("\n=====================\n");
    }

    // Now scrape the chapters for each volume
    for (let i = 0; i < volumes.length; i++) {
        const volume = volumes[i];
        const coverImagePath = coverImages[i]; // Get the cover image for this volume

        const { volumeNumber: volNum, customTitle: volTitle, startChapter: startCh, endChapter: endCh } = volume;

        const outputFileName = `${seriesName.replace(/\s+/g, '_')}_volume_${volNum}.epub`;

        console.log(`Scraping chapters ${startCh} to ${endCh} for Volume ${volNum}...\n`);

        const { chapters, failedChapters } = await scrapeChapterRange(startCh, endCh, seriesSlug);

        if (chapters.length > 0) {
            console.log(`\nFound ${chapters.length} chapters for Volume ${volNum}. Creating EPUB...`);
            await createEpub(chapters, `${outputFileName}.epub`, volNum, volTitle, seriesName, authorName, coverImagePath);
        }

        if (failedChapters.length === 0) {
            console.log(`All chapters of Volume ${volNum} successfully scraped.\n`);
            volumeStatus.push({ volumeNumber: volNum, status: "success" });
        } else {
            console.log(`Unable to scrape the following chapters of Volume ${volNum}: ${failedChapters.join(', ')}\n`);
            volumeStatus.push({ volumeNumber: volNum, status: "failed", failedChapters });
        }

        console.log("=================================\n");
    }

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

    const seriesUrl = await askForString('Enter the URL of the series! It can be any chapter you would like. \n\nExample: (https://www.lightnovelworld.co/novel/{series-name}-{series-id}/chapter-{chapter-id})\nor\n(https://www.lightnovelworld.co/novel/the-beginning-after-the-end-548/chapter-6-16091352)\nor\n(https://www.lightnovelworld.co/novel/lord-of-the-mysteries-275/chapter-1103):\n');

    const urlParts = seriesUrl.split('/');
    const seriesSlug = urlParts[4];  // Extract the series slug from the URL

    const seriesName = await askForString('Enter the series name: ');  // Ask for the series name
    const authorName = await askForString('Enter the author name: ');  // Ask for the author name

    const startVolume = await askForNumber('Enter the starting volume number: ');
    const endVolume = await askForNumber('Enter the ending volume number: ');

    const confirmation = await confirmAction(
        `You entered the following volume range:\nStart Volume: ${startVolume}\nEnd Volume: ${endVolume}\nSeries: ${seriesName}\nAuthor: ${authorName}\nIs this correct?`
    );

    if (confirmation) {
        console.log(`Gathering information for volumes ${startVolume} to ${endVolume} of ${seriesName}...\n`);
        const status = await scrapeMultipleVolumes(startVolume, endVolume, seriesName, authorName, seriesSlug);

        const runAgain = await confirmAction("Do you want to run the program again?");
        if (runAgain) {
            console.log("\nRestarting the program...\n");
            await main();
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
