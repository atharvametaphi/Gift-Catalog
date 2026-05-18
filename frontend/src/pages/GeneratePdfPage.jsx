import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import PictureAsPdfRoundedIconRaw from "@mui/icons-material/PictureAsPdfRounded";
import DeleteSweepRoundedIconRaw from "@mui/icons-material/DeleteSweepRounded";
import AutoAwesomeRoundedIconRaw from "@mui/icons-material/AutoAwesomeRounded";
import BrandingWatermarkRoundedIconRaw from "@mui/icons-material/BrandingWatermarkRounded";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import { useCatalogStore } from "../store/catalogStore";
import resolveIconComponent from "../utils/resolveIconComponent";

const PictureAsPdfRoundedIcon = resolveIconComponent(PictureAsPdfRoundedIconRaw);
const DeleteSweepRoundedIcon = resolveIconComponent(DeleteSweepRoundedIconRaw);
const AutoAwesomeRoundedIcon = resolveIconComponent(AutoAwesomeRoundedIconRaw);
const BrandingWatermarkRoundedIcon = resolveIconComponent(BrandingWatermarkRoundedIconRaw);
const MotionCard = motion(Card);

const pdfLayoutOptions = [
  { value: "single", label: "1/page", columns: 1, rows: 1 },
  { value: "double", label: "2/page", columns: 1, rows: 2 },
  { value: "grid-2", label: "2x2", columns: 2, rows: 2 },
  { value: "grid-3", label: "3x3", columns: 3, rows: 3 },
  { value: "grid-4", label: "4x4", columns: 4, rows: 4 },
];

const pdfLayoutMap = pdfLayoutOptions.reduce((accumulator, option) => {
  accumulator[option.value] = option;
  return accumulator;
}, {});

const wrapText = (text, maxChars = 64) => {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars) {
      if (line) {
        lines.push(line);
      }
      line = word;
    } else {
      line = next;
    }
  });

  if (line) {
    lines.push(line);
  }

  return lines;
};

const embedCatalogImage = async (pdfDoc, imageSource) => {
  if (!imageSource) {
    return null;
  }

  if (typeof imageSource !== "string") {
    return null;
  }

  const normalized = imageSource.toLowerCase();
  if (normalized.startsWith("data:image/png")) {
    return pdfDoc.embedPng(imageSource);
  }

  if (normalized.startsWith("data:image/jpeg") || normalized.startsWith("data:image/jpg")) {
    return pdfDoc.embedJpg(imageSource);
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      const response = await fetch(imageSource, { mode: "cors" });
      if (!response.ok) {
        return null;
      }

      const contentType = (response.headers.get("content-type") || "").toLowerCase();
      const bytes = new Uint8Array(await response.arrayBuffer());

      if (contentType.includes("png")) {
        return pdfDoc.embedPng(bytes);
      }

      return pdfDoc.embedJpg(bytes);
    } catch (error) {
      return null;
    }
  }

  return null;
};

const drawPdfHeader = (page, font) => {
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  page.drawRectangle({
    x: 34,
    y: pageHeight - 92,
    width: pageWidth - 68,
    height: 62,
    color: rgb(0.96, 0.95, 1),
    borderColor: rgb(0.87, 0.84, 0.99),
    borderWidth: 1,
  });
  page.drawText("Corporate Gifting Proposal", {
    x: 48,
    y: pageHeight - 60,
    size: 16,
    font,
    color: rgb(0.27, 0.25, 0.35),
  });
};

const GeneratePdfPage = () => {
  const { categories, subCategories, catalogItems, selectedItems, setSelectedImage, clearSelections } = useCatalogStore((state) => ({
    categories: state.categories,
    subCategories: state.subCategories,
    catalogItems: state.catalogItems,
    selectedItems: state.selectedItems,
    setSelectedImage: state.setSelectedImage,
    clearSelections: state.clearSelections,
  }));
  const [generating, setGenerating] = useState(false);
  const [pdfLayout, setPdfLayout] = useState("single");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const selectedCatalogItems = useMemo(
    () =>
      catalogItems
        .filter((item) => Boolean(selectedItems[item.id]))
        .map((item) => ({
          ...item,
          categoryName: categories.find((category) => category.id === item.categoryId)?.name || "",
          subCategoryName: subCategories.find((subCategory) => subCategory.id === item.subCategoryId)?.name || "",
          imageIndex: selectedItems[item.id]?.imageIndex || 0,
        })),
    [catalogItems, selectedItems, categories, subCategories],
  );

  const handleGeneratePdf = async () => {
    if (selectedCatalogItems.length === 0) {
      setSnackbar({
        open: true,
        severity: "warning",
        message: "Select at least one catalog item before generating PDF.",
      });
      return;
    }

    setGenerating(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const selectedLayout = pdfLayoutMap[pdfLayout] || pdfLayoutOptions[0];
      const itemsPerPage = selectedLayout.columns * selectedLayout.rows;
      const imageCache = new Map();
      const resolveEmbeddedImage = async (imageSource) => {
        if (!imageSource) {
          return null;
        }
        if (imageCache.has(imageSource)) {
          return imageCache.get(imageSource);
        }
        const embedded = await embedCatalogImage(pdfDoc, imageSource);
        imageCache.set(imageSource, embedded);
        return embedded;
      };

      for (let start = 0; start < selectedCatalogItems.length; start += itemsPerPage) {
        const pageItems = selectedCatalogItems.slice(start, start + itemsPerPage);
        const page = pdfDoc.addPage([595, 842]);
        drawPdfHeader(page, font);

        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();
        const left = 34;
        const right = 34;
        const bottom = 36;
        const contentTop = pageHeight - 112;
        const gapX = selectedLayout.columns >= 4 ? 6 : selectedLayout.columns >= 3 ? 8 : 12;
        const gapY = selectedLayout.rows >= 4 ? 6 : selectedLayout.rows >= 3 ? 8 : 12;
        const usableWidth = pageWidth - left - right;
        const usableHeight = contentTop - bottom;
        const cellWidth = (usableWidth - gapX * (selectedLayout.columns - 1)) / selectedLayout.columns;
        const cellHeight = (usableHeight - gapY * (selectedLayout.rows - 1)) / selectedLayout.rows;
        const denseLevel = selectedLayout.columns * selectedLayout.rows;
        const showDescription = denseLevel <= 4;
        const showMeta = denseLevel <= 2;
        const cardPadding = denseLevel >= 16 ? 4 : denseLevel >= 9 ? 6 : 8;
        const titleSize = denseLevel >= 16 ? 6.8 : denseLevel >= 9 ? 8 : denseLevel >= 4 ? 9 : 13;
        const descSize = denseLevel >= 4 ? 7.2 : 10;
        const metaSize = denseLevel >= 4 ? 6.2 : 8.8;

        for (let index = 0; index < pageItems.length; index += 1) {
          const item = pageItems[index];
          const row = Math.floor(index / selectedLayout.columns);
          const col = index % selectedLayout.columns;
          const x = left + col * (cellWidth + gapX);
          const y = contentTop - (row + 1) * cellHeight - row * gapY;

          page.drawRectangle({
            x,
            y,
            width: cellWidth,
            height: cellHeight,
            color: rgb(1, 1, 1),
            borderColor: rgb(0.89, 0.88, 0.91),
            borderWidth: 1,
          });

          const imageRatio = denseLevel <= 2 ? 0.62 : denseLevel === 4 ? 0.68 : denseLevel === 9 ? 0.78 : 0.82;
          const imageHeight = Math.max(34, cellHeight * imageRatio - cardPadding);
          const imageX = x + cardPadding;
          const imageY = y + cellHeight - cardPadding - imageHeight;
          const imageWidth = cellWidth - cardPadding * 2;
          const imageData = item.images[item.imageIndex] || item.images[0];
          const embeddedImage = await resolveEmbeddedImage(imageData);

          if (embeddedImage) {
            page.drawImage(embeddedImage, {
              x: imageX,
              y: imageY,
              width: imageWidth,
              height: imageHeight,
            });
          } else {
            page.drawRectangle({
              x: imageX,
              y: imageY,
              width: imageWidth,
              height: imageHeight,
              color: rgb(0.97, 0.98, 1),
              borderColor: rgb(0.87, 0.84, 0.99),
              borderWidth: 1,
            });
            page.drawText("Image", {
              x: imageX + Math.max(3, imageWidth / 2 - 14),
              y: imageY + imageHeight / 2 - 4,
              size: Math.max(6, titleSize - 1),
              font,
              color: rgb(0.49, 0.46, 0.58),
            });
          }

          let textCursorY = imageY - (denseLevel >= 9 ? 8 : 12);
          const titleMaxChars = Math.max(10, Math.floor(cellWidth / (denseLevel >= 9 ? 7 : 6)));
          const titleLines = wrapText(item.name, titleMaxChars).slice(0, denseLevel >= 9 ? 1 : 2);

          titleLines.forEach((line) => {
            if (textCursorY <= y + cardPadding + titleSize) {
              return;
            }
            page.drawText(line, {
              x: x + cardPadding,
              y: textCursorY,
              size: titleSize,
              font,
              color: rgb(0.26, 0.25, 0.29),
            });
            textCursorY -= titleSize + 3;
          });

          if (showDescription) {
            const descLines = wrapText(item.description, Math.max(16, Math.floor(cellWidth / 6.5))).slice(0, denseLevel === 4 ? 1 : 3);
            descLines.forEach((line) => {
              if (textCursorY <= y + cardPadding + descSize) {
                return;
              }
              page.drawText(line, {
                x: x + cardPadding,
                y: textCursorY,
                size: descSize,
                font,
                color: rgb(0.42, 0.40, 0.47),
              });
              textCursorY -= descSize + 2;
            });
          }

          if (showMeta && textCursorY > y + cardPadding + metaSize) {
            page.drawText(`${item.categoryName} | ${item.subCategoryName}`, {
              x: x + cardPadding,
              y: textCursorY,
              size: metaSize,
              font,
              color: rgb(0.46, 0.43, 0.55),
            });
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const url = URL.createObjectURL(blob);

      link.href = url;
      link.download = `gift-catalog-${timestamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        severity: "success",
        message: "PDF generated and download started.",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Failed to generate PDF. Please try again.",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Generate PDF"
        subtitle="Build a refined gifting proposal by selecting one visual per item and exporting a premium catalog PDF."
        // eyebrow="Proposal Builder"
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          {selectedCatalogItems.length === 0 ? (
            <Card sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 5 }}>
              <CardContent sx={{ textAlign: "center", py: 7 }}>
                <PictureAsPdfRoundedIcon sx={{ fontSize: 46, color: "text.disabled", mb: 1.2 }} />
                <Typography variant="h5" sx={{ mb: 1 }}>
                  No products selected yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Go to Catalog and use "Select for PDF" on the products you want to include.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              {selectedCatalogItems.map((item) => (
                <MotionCard
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26, ease: "easeOut" }}
                  sx={{ border: "1px solid", borderColor: "divider", borderRadius: 5 }}
                >
                  <CardContent sx={{ p: 2.2 }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2.2}>
                      <Box
                        component="img"
                        src={item.images[item.imageIndex]}
                        alt={item.name}
                        loading="lazy"
                        sx={{
                          width: { xs: "100%", md: 250 },
                          height: 170,
                          objectFit: "cover",
                          borderRadius: 3.2,
                        }}
                      />

                      <Stack sx={{ flex: 1 }} spacing={1.1}>
                        <Typography variant="h5" sx={{ lineHeight: 1.1 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
                          {item.description}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip size="small" label={item.categoryName} />
                          <Chip size="small" variant="outlined" label={item.subCategoryName} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          Choose one image for PDF:
                        </Typography>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          {item.images.map((image, index) => (
                            <Box
                              key={`${item.id}-image-${index}`}
                              component="button"
                              type="button"
                              onClick={() => setSelectedImage(item.id, index)}
                              sx={{
                                p: 0,
                                width: 64,
                                height: 64,
                                borderRadius: 1.8,
                                overflow: "hidden",
                                border: "1px solid",
                                borderColor: item.imageIndex === index ? "primary.main" : "divider",
                                cursor: "pointer",
                                bgcolor: "transparent",
                              }}
                            >
                              <Box
                                component="img"
                                src={image}
                                alt={`${item.name} option ${index + 1}`}
                                loading="lazy"
                                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </Box>
                          ))}
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </MotionCard>
              ))}
            </Stack>
          )}
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              position: { lg: "sticky" },
              top: { lg: 102 },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,0.94)",
              backdropFilter: "blur(8px)",
            }}
          >
            <CardContent sx={{ p: 2.4 }}>
              <Typography variant="h5" sx={{ mb: 0.9 }}>
                PDF Proposal Summary
              </Typography>
              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 1.8 }}>
                <BrandingWatermarkRoundedIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                <Typography variant="caption" sx={{ letterSpacing: "0.14em", textTransform: "uppercase", color: "text.secondary" }}>
                  Brand Logo Placeholder
                </Typography>
              </Stack>

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.8 }}>
                PDF Layout
              </Typography>
              <ToggleButtonGroup
                value={pdfLayout}
                exclusive
                fullWidth
                size="small"
                onChange={(event, value) => {
                  if (value) {
                    setPdfLayout(value);
                  }
                }}
                sx={{
                  mb: 1.6,
                  "& .MuiToggleButton-root": {
                    py: 0.5,
                    px: 0.8,
                    fontSize: 12,
                    fontWeight: 600,
                  },
                }}
              >
                {pdfLayoutOptions.map((option) => (
                  <ToggleButton key={option.value} value={option.value}>
                    {option.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.8 }}>
                Preview Selection
              </Typography>
              <Stack direction="row" spacing={0.7} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                {selectedCatalogItems.slice(0, 8).map((item) => (
                  <Box
                    key={`${item.id}-summary-thumb`}
                    component="img"
                    src={item.images[item.imageIndex] || item.images[0]}
                    alt={item.name}
                    sx={{ width: 44, height: 44, borderRadius: 1.3, objectFit: "cover", border: "1px solid", borderColor: "divider" }}
                  />
                ))}
              </Stack>

              <Button
                fullWidth
                variant="contained"
                startIcon={<AutoAwesomeRoundedIcon />}
                onClick={handleGeneratePdf}
                disabled={generating}
                sx={{ mb: 1.1 }}
              >
                {generating ? "Generating..." : "Generate PDF"}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<DeleteSweepRoundedIcon />}
                onClick={clearSelections}
                disabled={selectedCatalogItems.length === 0}
              >
                Clear Selection
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2800}
        onClose={() => setSnackbar((previous) => ({ ...previous, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((previous) => ({ ...previous, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GeneratePdfPage;
