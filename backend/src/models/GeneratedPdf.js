import mongoose from "mongoose";

const generatedPdfSchema = new mongoose.Schema(
  {
    catalogueId: {
      type: String,
      trim: true,
      required: true,
    },
    catalogueTitle: {
      type: String,
      trim: true,
      required: true,
    },
    clientName: {
      type: String,
      trim: true,
      required: true,
    },
    fileName: {
      type: String,
      trim: true,
      required: true,
    },
    pdfDataUrl: {
      type: String,
      required: true,
    },
    gridLayout: {
      type: String,
      enum: ["4", "6", "9", "12", "16", "20"],
      required: true,
    },
    productCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const GeneratedPdf = mongoose.model("GeneratedPdf", generatedPdfSchema, "pdfs");

export default GeneratedPdf;

