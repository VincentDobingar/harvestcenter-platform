import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateReceipt = (student, amount) => {

  if (!fs.existsSync("receipts")) {
    fs.mkdirSync("receipts");
  }

  const doc = new PDFDocument();
  const filePath = path.join("receipts", `receipt-${student.id}.pdf`);
  doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(22).text("HARVEST CENTER", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Facture N°: HC-${student.id}-${Date.now()}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.text(`Client: ${student.nom} ${student.prenom}`);
    doc.text(`Email: ${student.email}`);
    doc.moveDown();

    doc.text("Détail:");
    doc.text("----------------------------------------");
    doc.text(`Frais inscription : ${amount} FCFA`);
    doc.text("----------------------------------------");

    doc.moveDown();
    doc.fontSize(16).text(`TOTAL : ${amount} FCFA`, { align: "right" });

    doc.moveDown(2);
    doc.fontSize(10).text("Merci pour votre confiance.");
  doc.end();

  return filePath;
};
