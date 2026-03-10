import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * Générer un PDF en stream
 * @param {string} fileName
 * @param {Array} data
 * @returns {Promise<string>} chemin du fichier
 */
export function generatePDF(fileName, data) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(process.cwd(), "uploads", fileName);
    const doc = new PDFDocument();

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    data.forEach((line) => {
      doc.text(line.join(" | "));
      doc.moveDown();
    });

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", (err) => reject(err));
  });
}