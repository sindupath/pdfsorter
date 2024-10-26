const fs = require("fs-extra");
const path = require("path");
const pdfParse = require("pdf-parse");

const pdfFolder = path.join(__dirname, "pdfs");
const matchFolder = path.join(__dirname, "match");
const unMatchFolder = path.join(__dirname, "unmatch");

// Ensure both directories exist
fs.ensureDirSync(matchFolder);
fs.ensureDirSync(unMatchFolder);

const searchTerms = ["fitter","Category: SC"]; // Update this array with terms you want to search

async function checkPdf(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const textContent = pdfData.text.toLowerCase();

    // Check if any of the search terms are found in the text
    for (let term of searchTerms) {
      if (textContent.includes(term.toLowerCase())) {
        return true; // Return true if a match is found
      }
    }
    return false; // Return false if no matches found
  } catch (error) {
    console.error(`Error parsing PDF file ${filePath}:`, error.message);
    return false; // Treat as unmatched if there's an error
  }
}

async function processPdfs() {
  try {
    const files = await fs.readdir(pdfFolder);
    for (let file of files) {
      const filePath = path.join(pdfFolder, file);
      if (path.extname(file).toLowerCase() === ".pdf") {
        const isMatch = await checkPdf(filePath);
        const destination = isMatch ? matchFolder : unMatchFolder;
        try {
          await fs.move(filePath, path.join(destination, file), {
            overwrite: true,
          });
          console.log(
            `Moved ${file} to ${isMatch ? "match folder" : "unmatch folder"}`
          );
        } catch (moveError) {
          console.error(`Error moving file ${file}:`, moveError.message);
        }
      }
    }
  } catch (err) {
    console.error("Error reading PDF folder:", err.message);
  }
}

processPdfs()
  .then(() => console.log("Processing complete"))
  .catch(console.error);
