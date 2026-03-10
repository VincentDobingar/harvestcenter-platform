import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

export const sendWhatsAppAlert = async (phone, completionRate) => {
  await client.messages.create({
    from: "whatsapp:+14155238886",
    to: `whatsapp:${phone}`,
    body: `Alert: Your completion rate is ${completionRate}%. Please submit pending assignments.`,
  });
};
