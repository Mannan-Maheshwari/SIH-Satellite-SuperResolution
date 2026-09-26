require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Analysis = require("./models/Analysis");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);
app.use(express.json());

const publicDir = path.join(__dirname, "..", "public");
const uploadsDir = path.join(publicDir, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

app.use("/media", express.static(publicDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  }
});

function chooseDemoImage(originalName = "") {
  const lower = originalName.toLowerCase();
  if (lower.includes("urban") || lower.includes("city")) return "urban-enhanced.png";
  if (lower.includes("gurugram") || lower.includes("city")) return "gurugram-enhanced.png";
  if (lower.includes("agri") || lower.includes("farm")) return "agriculture-enhanced.png";
  if (lower.includes("water") || lower.includes("flood")) return "water-enhanced.png";
  return "urban-enhanced.png";
}

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    product: "SRM Vision",
    mode: "prototype"
  });
});

app.post("/api/enhance", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a JPG, PNG, or WEBP image." });
  }

  const enhancedName = chooseDemoImage(req.file.originalname);

  // Simulated processing delay for prototype demonstration.
  await new Promise((resolve) => setTimeout(resolve, 6500));

  const result = {
    id: `demo-${Date.now()}`,
    originalFileName: req.file.originalname,
    originalImageUrl: `/media/uploads/${req.file.filename}`,
    enhancedImageUrl: `/media/demo/${enhancedName}`,
    sourceResolution: "10 m/pixel",
    targetResolution: "2.5 m/pixel (target)",
    status: "completed",
    prototype: true
  };

  if (process.env.MONGODB_URI) {
    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
      }
      const saved = await Analysis.create(result);
      result.id = saved._id.toString();
    } catch (error) {
      console.warn("MongoDB persistence skipped:", error.message);
    }
  }

  res.json(result);
});

app.get("/api/analyses/:id", async (req, res) => {
  if (!mongoose.connection.readyState) {
    return res.status(503).json({ message: "MongoDB is not connected in this prototype." });
  }

  const analysis = await Analysis.findById(req.params.id);
  if (!analysis) return res.status(404).json({ message: "Analysis not found." });

  res.json(analysis);
});

app.listen(PORT, () => {
  console.log(`SRM Vision server running on http://localhost:${PORT}`);
});
