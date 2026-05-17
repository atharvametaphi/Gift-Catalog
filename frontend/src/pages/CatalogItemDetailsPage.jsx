import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIconRaw from "@mui/icons-material/ArrowBackRounded";
import CheckCircleOutlineRoundedIconRaw from "@mui/icons-material/CheckCircleOutlineRounded";
import RadioButtonUncheckedRoundedIconRaw from "@mui/icons-material/RadioButtonUncheckedRounded";
import { AnimatePresence, motion } from "framer-motion";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useCatalogStore } from "../store/catalogStore";
import resolveIconComponent from "../utils/resolveIconComponent";

const ArrowBackRoundedIcon = resolveIconComponent(ArrowBackRoundedIconRaw);
const CheckCircleOutlineRoundedIcon = resolveIconComponent(CheckCircleOutlineRoundedIconRaw);
const RadioButtonUncheckedRoundedIcon = resolveIconComponent(RadioButtonUncheckedRoundedIconRaw);
const MotionBox = motion(Box);

const CatalogItemDetailsPage = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const { categories, subCategories, catalogItems, selectedItems, toggleItemSelection, setSelectedImage } = useCatalogStore((state) => ({
    categories: state.categories,
    subCategories: state.subCategories,
    catalogItems: state.catalogItems,
    selectedItems: state.selectedItems,
    toggleItemSelection: state.toggleItemSelection,
    setSelectedImage: state.setSelectedImage,
  }));
  const item = useMemo(() => catalogItems.find((catalogItem) => catalogItem.id === itemId), [itemId]);
  const selectedEntry = item ? selectedItems[item.id] : null;
  const isSelected = Boolean(selectedEntry);
  const [previewIndex, setPreviewIndex] = useState(selectedEntry?.imageIndex ?? 0);
  const slideDurationMs = 2800;

  const itemMeta = useMemo(() => {
    if (!item) {
      return null;
    }

    const categoryName = categories.find((category) => category.id === item.categoryId)?.name || "Unknown Category";
    const subCategoryName =
      subCategories.find((subCategory) => subCategory.id === item.subCategoryId)?.name || "Unknown Sub-Category";

    return { categoryName, subCategoryName };
  }, [item]);

  useEffect(() => {
    setPreviewIndex(selectedEntry?.imageIndex ?? 0);
  }, [itemId, selectedEntry]);

  useEffect(() => {
    if (!item || item.images.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setPreviewIndex((previousIndex) => (previousIndex + 1) % item.images.length);
    }, slideDurationMs);

    return () => window.clearInterval(timer);
  }, [item, slideDurationMs]);

  if (!item || !itemMeta) {
    return (
      <Box>
        <PageHeader title="Item Not Found" subtitle="The requested catalog item is not available." />
        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/catalog")}
        >
          Back to Catalog
        </Button>
      </Box>
    );
  }

  const handleSelect = () => {
    toggleItemSelection(item.id, previewIndex);
    if (!isSelected) {
      setSelectedImage(item.id, previewIndex);
    }
  };

  const handlePreviewSelect = (index) => {
    setPreviewIndex(index);
    if (isSelected) {
      setSelectedImage(item.id, index);
    }
  };

  const selectedImage = item.images[previewIndex] || item.images[0];

  return (
    <MotionBox
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: "easeOut" }}
    >
      <PageHeader
        title={item.name}
        subtitle="Review item details, pick the final image, and add it to the PDF selection."
        eyebrow="Product Detail"
      />

      <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 5 }}>
        <CardContent sx={{ p: { xs: 2, md: 2.6 } }}>
          <Stack spacing={2}>
            <Button
              component={RouterLink}
              to="/catalog"
              variant="text"
              startIcon={<ArrowBackRoundedIcon />}
              sx={{ alignSelf: "flex-start", px: 0.2 }}
            >
              Back to Catalog
            </Button>

            <Stack direction={{ xs: "column", lg: "row" }} spacing={2.2}>
              <Box sx={{ width: { xs: "100%", lg: 560 }, flexShrink: 0 }}>
                <Box
                  sx={{
                    width: "100%",
                    borderRadius: 4,
                    aspectRatio: "16 / 10",
                    display: "block",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <AnimatePresence initial={false} mode="sync">
                    <motion.div
                      key={`${item.id}-${previewIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.58, ease: "easeInOut" }}
                      style={{
                        position: "absolute",
                        inset: 0,
                      }}
                    >
                      <motion.img
                        src={selectedImage}
                        alt={item.name}
                        loading="lazy"
                        animate={{ scale: [1.04, 1] }}
                        transition={{ duration: slideDurationMs / 1000, ease: "linear" }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                </Box>

                <Stack direction="row" spacing={1} sx={{ mt: 1.2, flexWrap: "wrap" }}>
                  {item.images.map((image, index) => (
                    <Box
                      key={`${item.id}-detail-preview-${index}`}
                      component="button"
                      type="button"
                      onClick={() => handlePreviewSelect(index)}
                      sx={{
                        p: 0,
                        width: 76,
                        height: 76,
                        borderRadius: 1.8,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: previewIndex === index ? "primary.main" : "divider",
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
              </Box>

              <Stack spacing={1.3} sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body1" color="text.secondary">
                  {item.description}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" label={itemMeta.categoryName} />
                  <Chip size="small" variant="outlined" label={itemMeta.subCategoryName} />
                  <Chip
                    size="small"
                    label={`Added ${new Date(item.createdAt).toLocaleDateString()}`}
                    variant="outlined"
                  />
                </Stack>

                <Stack direction="row" spacing={1} sx={{ pt: 0.8, flexWrap: "wrap" }}>
                  <Button
                    variant={isSelected ? "contained" : "outlined"}
                    color={isSelected ? "success" : "primary"}
                    onClick={handleSelect}
                    startIcon={
                      isSelected ? (
                        <CheckCircleOutlineRoundedIcon fontSize="small" />
                      ) : (
                        <RadioButtonUncheckedRoundedIcon fontSize="small" />
                      )
                    }
                  >
                    {isSelected ? "Selected for PDF" : "Select for PDF"}
                  </Button>

                  <Button
                    component={RouterLink}
                    to="/generate-pdf"
                    variant="outlined"
                    disabled={!isSelected}
                  >
                    Go to Generate PDF
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </MotionBox>
  );
};

export default CatalogItemDetailsPage;
