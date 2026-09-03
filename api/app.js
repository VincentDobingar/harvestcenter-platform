// api/app.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

const allowedOrigins = [
  "https://www.harvestcentertd.org",
  "https://harvestcentertd.org",
  "https://api.harvestcentertd.org",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173"
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.log("CORS blocked origin:", origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================
// Routes API
// ==========================
import adminRoutes from "./routes/admin.routes.js";
import assignmentsRoutes from "./routes/assignments.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import authRoutes from "./routes/auth.routes.js";
import formationsRoutes from "./routes/formations.routes.js";
import gradeRoutes from "./routes/grades.routes.js";
import healthRoutes from "./routes/health.routes.js";
import inscriptionRoutes from "./routes/inscription.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import studentRoutes from "./routes/student.routes.js";
import superadminRoutes from "./routes/superadmin.routes.js";
import syncRoutes from "./routes/sync.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import opportunitiesRoutes from "./routes/opportunities.routes.js";
import newsRoutes from "./routes/news.routes.js";
import contactRoutes from "./routes/contact.routes.js";

// ==========================
// Appliquer les routes
// ==========================
app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/formations", formationsRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/inscription", inscriptionRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/opportunities", opportunitiesRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/contact", contactRoutes); 

// ==========================
// Root endpoint
// ==========================
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "HarvestCenter TD API",
    version: "2.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// ==========================
// Error handler global
// ==========================
app.use((err, req, res, next) => {
  console.error("🔥 FULL ERROR:", err);

  res.status(500).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
});

// ==========================
// 404 handler
// ==========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

export default app;