import nodemailer from "nodemailer";

export const sendRiskEmail = async (to, completionRate) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Academic Risk Alert",
    html: `
      <h3>Attention</h3>
      <p>Your completion rate is ${completionRate}%.</p>
      <p>Please submit your pending assignments.</p>
    `,
  });
};
