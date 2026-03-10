import dotenv from 'dotenv';
dotenv.config();   // ðŸ‘ˆ charger .env en premier

import app from "./app.js";

const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.json({ message: "HarvestCenter API is running 🚀" });
});

app.listen(PORT, () => {
  console.log(`🚀 HarvestCenter API running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});