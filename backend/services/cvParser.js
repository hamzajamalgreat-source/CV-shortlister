const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

async function parsePDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    console.error("PDF parse error:", error.message);
    throw new Error("Failed to parse PDF");
  }
}

async function parseDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (error) {
    console.error("DOCX parse error:", error.message);
    throw new Error("Failed to parse DOCX");
  }
}

async function parseCV(fileBuffer, filename) {
  const ext = path.extname(filename).toLowerCase();
  
  let text = "";
  if (ext === ".pdf") {
    text = await parsePDF(fileBuffer);
  } else if (ext === ".docx") {
    text = await parseDOCX(fileBuffer);
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  if (!text || text.trim().length === 0) {
    throw new Error("No text extracted from CV");
  }

  return text.substring(0, 8000); // Limit to 8000 chars
}

module.exports = { parseCV };
