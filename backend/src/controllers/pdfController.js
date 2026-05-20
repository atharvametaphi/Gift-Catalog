import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import GeneratedPdf from "../models/GeneratedPdf.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const normalizeText = (value) => String(value || "").trim();

const mapPdf = (doc) => ({
  id: doc._id.toString(),
  catalogueId: doc.catalogueId,
  catalogueTitle: doc.catalogueTitle,
  clientName: doc.clientName,
  fileName: doc.fileName,
  pdfDataUrl: doc.pdfDataUrl,
  gridLayout: doc.gridLayout,
  productCount: typeof doc.productCount === "number" ? doc.productCount : 0,
  createdBy: doc.createdBy || "",
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const getPdfs = asyncHandler(async (req, res) => {
  const docs = await GeneratedPdf.find().sort({ createdAt: -1 }).lean();
  return res.status(200).json({
    pdfs: docs.map(mapPdf),
  });
});

export const createPdf = asyncHandler(async (req, res) => {
  const catalogueId = normalizeText(req.body.catalogueId);
  const catalogueTitle = normalizeText(req.body.catalogueTitle);
  const clientName = normalizeText(req.body.clientName);
  const fileName = normalizeText(req.body.fileName);
  const pdfDataUrl = normalizeText(req.body.pdfDataUrl);
  const gridLayout = normalizeText(req.body.gridLayout);
  const parsedProductCount = Number(req.body.productCount);
  const productCount = Number.isFinite(parsedProductCount) && parsedProductCount >= 0 ? parsedProductCount : 0;
  const createdBy = normalizeText(req.body.createdBy) || String(req.user?._id || "");

  if (!catalogueId) {
    return res.status(400).json({ message: "Catalogue id is required." });
  }

  if (!catalogueTitle) {
    return res.status(400).json({ message: "Catalogue title is required." });
  }

  if (!clientName) {
    return res.status(400).json({ message: "Client name is required." });
  }

  if (!fileName) {
    return res.status(400).json({ message: "PDF file name is required." });
  }

  if (!pdfDataUrl.startsWith("data:application/pdf")) {
    return res.status(400).json({ message: "Invalid PDF payload. Expected PDF data URL." });
  }

  if (!["4", "6", "9", "12", "16", "20"].includes(gridLayout)) {
    return res.status(400).json({ message: "Invalid grid layout." });
  }

  const doc = await GeneratedPdf.create({
    catalogueId,
    catalogueTitle,
    clientName,
    fileName,
    pdfDataUrl,
    gridLayout,
    productCount,
    createdBy,
  });

  return res.status(201).json({
    pdf: mapPdf(doc),
  });
});

export const deletePdf = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isObjectId(id)) {
    return res.status(400).json({ message: "Invalid PDF id." });
  }

  const doc = await GeneratedPdf.findById(id);
  if (!doc) {
    return res.status(404).json({ message: "PDF not found." });
  }

  await doc.deleteOne();
  return res.status(200).json({ message: "PDF deleted successfully." });
});

