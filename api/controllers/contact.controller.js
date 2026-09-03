import nodemailer from "nodemailer";

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || "true") === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendContactMessage = async (req, res) => {
  try {
    const { nom, email, sujet, message } = req.body;

    if (!nom || !email || !sujet || !message) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont obligatoires.",
      });
    }

    const receiver = process.env.CONTACT_RECEIVER || "contact@harvestcentertd.org";

    const safeNom = escapeHtml(nom);
    const safeEmail = escapeHtml(email);
    const safeSujet = escapeHtml(sujet);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    await transporter.sendMail({
      from: `"Harvest Center Website" <${process.env.SMTP_USER}>`,
      to: receiver,
      replyTo: email,
      subject: `[Contact Site] ${sujet}`,
      text: `
Nouveau message depuis le site Harvest Center

Nom: ${nom}
Email: ${email}
Sujet: ${sujet}

Message:
${message}
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
          <h2 style="color: #1d4ed8;">Nouveau message depuis le site Harvest Center</h2>
          <p><strong>Nom :</strong> ${safeNom}</p>
          <p><strong>Email :</strong> ${safeEmail}</p>
          <p><strong>Sujet :</strong> ${safeSujet}</p>
          <p><strong>Message :</strong><br>${safeMessage}</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "Votre message a été envoyé avec succès.",
    });
  } catch (error) {
    console.error("sendContactMessage error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi du message.",
    });
  }
};