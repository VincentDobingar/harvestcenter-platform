import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoicePDF = async (payment, user, formation) => {

  const invoicesDir = path.resolve('invoices');
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

  const filePath = path.join(invoicesDir, `invoice-${payment.id}.pdf`);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text('FACTURE DE PAIEMENT', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Référence : ${payment.transaction_ref}`);
  doc.text(`Date : ${new Date(payment.created_at).toLocaleDateString()}`);
  doc.moveDown();

  doc.text(`Étudiant : ${user.first_name} ${user.last_name}`);
  doc.text(`Email : ${user.email}`);
  doc.moveDown();

  doc.text(`Formation : ${formation?.title || '—'}`);
  doc.text(`Montant payé : ${payment.amount} FCFA`);
  doc.text(`Opérateur : ${payment.provider.toUpperCase()}`);
  doc.text(`Statut : PAYÉ`);
  doc.moveDown(2);

  doc.text('Merci pour votre confiance.', { align: 'center' });

  doc.end();

  return filePath;
};
