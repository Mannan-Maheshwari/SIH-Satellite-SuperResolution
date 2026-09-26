const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    originalFileName: { type: String, required: true },
    originalImageUrl: { type: String, required: true },
    enhancedImageUrl: { type: String, required: true },
    sourceResolution: { type: String, default: "10 m/pixel" },
    targetResolution: { type: String, default: "2.5 m/pixel (target)" },
    status: { type: String, default: "completed" },
    prototype: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", analysisSchema);
