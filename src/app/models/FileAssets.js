import mongoose from "mongoose";

const fileAssetsSchema = new mongoose.Schema({
  filename: String,
  filepath: String, // /uploads/folder/image.jpg
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: {
    email: String,
    role: String,
  },
  purpose: String,
  folder: String, // name of subfolder e.g., "general", "bills"
});

export default mongoose.models.FileAsset || mongoose.model("FileAsset", fileAssetsSchema);
