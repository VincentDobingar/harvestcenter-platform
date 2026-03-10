import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

/**
 * Lire un fichier Excel en stream
 * @param {string} fileName
 * @returns {Promise<Array>} sheetData
 */
export async function readExcel(fileName) {
  const filePath = path.join(process.cwd(), "uploads", fileName);

  if (!fs.existsSync(filePath)) throw new Error("Fichier non trouvé");

  const workbook = new ExcelJS.stream.xlsx.WorkbookReader(filePath);
  let sheetData = [];

  for await (const worksheet of workbook) {
    for await (const row of worksheet) {
      sheetData.push(row.values.slice(1));
    }
  }

  return sheetData;
}

/**
 * Écrire un fichier Excel en stream
 * @param {string} fileName
 * @param {Array} rows
 * @returns {Promise<void>}
 */
export async function writeExcel(fileName, rows) {
  const filePath = path.join(process.cwd(), "uploads", fileName);
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ filename: filePath });
  const worksheet = workbook.addWorksheet("Sheet1");

  rows.forEach((row) => worksheet.addRow(row).commit());
  await workbook.commit();

  return filePath;
}