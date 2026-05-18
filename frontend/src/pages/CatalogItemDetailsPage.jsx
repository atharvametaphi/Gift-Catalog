import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIconRaw from "@mui/icons-material/ArrowBackRounded";
import CheckCircleOutlineRoundedIconRaw from "@mui/icons-material/CheckCircleOutlineRounded";
import EditRoundedIconRaw from "@mui/icons-material/EditRounded";
import RadioButtonUncheckedRoundedIconRaw from "@mui/icons-material/RadioButtonUncheckedRounded";
import { AnimatePresence, motion } from "framer-motion";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useCatalogStore } from "../store/catalogStore";
import resolveIconComponent from "../utils/resolveIconComponent";

const ArrowBackRoundedIcon = resolveIconComponent(ArrowBackRoundedIconRaw);
const CheckCircleOutlineRoundedIcon = resolveIconComponent(CheckCircleOutlineRoundedIconRaw);
const EditRoundedIcon = resolveIconComponent(EditRoundedIconRaw);
const RadioButtonUncheckedRoundedIcon = resolveIconComponent(RadioButtonUncheckedRoundedIconRaw);
const MotionBox = motion(Box);

const CatalogItemDetailsPage = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const {
    categories,
    subCategories,
    allProducts,
    createdCatalogs,
    catalogItems,
    selectedItems,
    toggleItemSelection,
    setSelectedImage,
    updateCatalog,
  } = useCatalogStore((state) => ({
    categories: state.categories,
    subCategories: state.subCategories,
    allProducts: state.dbItems,
    createdCatalogs: state.createdCatalogs,
    catalogItems: state.catalogItems,
    selectedItems: state.selectedItems,
    toggleItemSelection: state.toggleItemSelection,
    setSelectedImage: state.setSelectedImage,
    updateCatalog: state.updateCatalog,
  }));
  const item = useMemo(() => catalogItems.find((catalogItem) => catalogItem.id === itemId), [itemId]);
  const selectedEntry = item ? selectedItems[item.id] : null;
  const isSelected = Boolean(selectedEntry);
  const [previewIndex, setPreviewIndex] = useState(selectedEntry?.imageIndex ?? 0);
  const [editCatalogOpen, setEditCatalogOpen] = useState(false);
  const [editCatalogDraft, setEditCatalogDraft] = useState({
    catalogId: "",
    categoryId: "",
    subCategoryId: "",
  });
  const [editSelectedProductIds, setEditSelectedProductIds] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const slideDurationMs = 2800;

  const itemMeta = useMemo(() => {
    if (!item) {
      return null;
    }

    const categoryName = categories.find((category) => category.id === item.categoryId)?.name || "Unknown Category";
    const subCategoryName =
      subCategories.find((subCategory) => subCategory.id === item.subCategoryId)?.name || "Unknown Sub-Category";

    return { categoryName, subCategoryName };
  }, [item, categories, subCategories]);

  const matchedCatalog = useMemo(() => {
    if (!item) {
      return null;
    }

    return (
      createdCatalogs.find(
        (catalog) => Array.isArray(catalog.itemIds) && catalog.itemIds.includes(item.id),
      ) ||
      createdCatalogs.find(
        (catalog) =>
          catalog.categoryId === item.categoryId &&
          catalog.subCategoryId === item.subCategoryId,
      ) ||
      null
    );
  }, [createdCatalogs, item]);

  const selectedCatalogForEdit = useMemo(
    () => createdCatalogs.find((catalog) => catalog.id === editCatalogDraft.catalogId) || null,
    [createdCatalogs, editCatalogDraft.catalogId],
  );

  const editCatalogSubCategories = useMemo(
    () =>
      subCategories.filter(
        (subCategory) =>
          subCategory.categoryId === editCatalogDraft.categoryId &&
          allProducts.some(
            (product) =>
              product.categoryId === editCatalogDraft.categoryId &&
              product.subCategoryId === subCategory.id,
          ),
      ),
    [subCategories, allProducts, editCatalogDraft.categoryId],
  );

  const editAutoFilledItems = useMemo(
    () =>
      allProducts.filter(
        (product) =>
          product.categoryId === editCatalogDraft.categoryId &&
          product.subCategoryId === editCatalogDraft.subCategoryId,
      ),
    [allProducts, editCatalogDraft.categoryId, editCatalogDraft.subCategoryId],
  );
  const selectedProductsForEdit = useMemo(
    () => editAutoFilledItems.filter((product) => editSelectedProductIds.includes(product.id)),
    [editAutoFilledItems, editSelectedProductIds],
  );

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

  const handleOpenEditCatalog = () => {
    if (!matchedCatalog) {
      setSnackbar({
        open: true,
        message: "No catalog is mapped for this product yet.",
        severity: "warning",
      });
      return;
    }

    setEditCatalogDraft({
      catalogId: matchedCatalog.id,
      categoryId: matchedCatalog.categoryId || "",
      subCategoryId: matchedCatalog.subCategoryId || "",
    });
    const scopedProducts = allProducts.filter(
      (product) =>
        product.categoryId === (matchedCatalog.categoryId || "") &&
        product.subCategoryId === (matchedCatalog.subCategoryId || ""),
    );
    const initialProductIds =
      Array.isArray(matchedCatalog.itemIds) && matchedCatalog.itemIds.length > 0
        ? matchedCatalog.itemIds.filter((productId) =>
            scopedProducts.some((product) => product.id === productId),
          )
        : scopedProducts.map((product) => product.id);
    setEditSelectedProductIds(initialProductIds);
    setEditCatalogOpen(true);
  };

  const handleUpdateCatalog = async () => {
    if (!editCatalogDraft.catalogId || !editCatalogDraft.categoryId || !editCatalogDraft.subCategoryId) {
      setSnackbar({
        open: true,
        message: "Select category and sub-category to update catalog.",
        severity: "warning",
      });
      return;
    }

    if (editAutoFilledItems.length === 0) {
      setSnackbar({
        open: true,
        message: "No items found for this category and sub-category.",
        severity: "warning",
      });
      return;
    }

    if (editSelectedProductIds.length === 0) {
      setSnackbar({
        open: true,
        message: "Select at least one product for this catalog.",
        severity: "warning",
      });
      return;
    }

    try {
      await updateCatalog({
        id: editCatalogDraft.catalogId,
        categoryId: editCatalogDraft.categoryId,
        subCategoryId: editCatalogDraft.subCategoryId,
        description: selectedCatalogForEdit?.description || "",
        status: selectedCatalogForEdit?.status || "active",
        itemIds: editSelectedProductIds,
      });
      setEditCatalogOpen(false);
      setSnackbar({
        open: true,
        message: "Catalog updated successfully.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to update catalog.",
        severity: "error",
      });
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
        // subtitle="Review item details, pick the final image, and add it to the PDF selection."
        eyebrow="Product Detail"
      />

      <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: "8px" }}>
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
                    borderRadius: "8px",
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
                        borderRadius: "6px",
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
                    variant="outlined"
                    startIcon={<EditRoundedIcon fontSize="small" />}
                    onClick={handleOpenEditCatalog}
                    disabled={!matchedCatalog}
                  >
                    Edit Catalog
                  </Button>

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

      <Dialog
        open={editCatalogOpen}
        onClose={() => setEditCatalogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.1 }}>Edit Catalog</DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Stack spacing={1.5}>
            <TextField
              label="Catalog"
              size="small"
              fullWidth
              value={selectedCatalogForEdit?.name || "Untitled Catalog"}
              InputProps={{ readOnly: true }}
            />

            <FormControl size="small" fullWidth disabled={!editCatalogDraft.catalogId}>
              <InputLabel>Category Selection</InputLabel>
              <Select
                value={editCatalogDraft.categoryId}
                label="Category Selection"
                onChange={(event) => {
                  const nextCategoryId = event.target.value;
                  setEditCatalogDraft((previous) => ({
                    ...previous,
                    categoryId: nextCategoryId,
                    subCategoryId: "",
                  }));
                  setEditSelectedProductIds([]);
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth disabled={!editCatalogDraft.categoryId}>
              <InputLabel>Sub-Category Selection</InputLabel>
              <Select
                value={editCatalogDraft.subCategoryId}
                label="Sub-Category Selection"
                onChange={(event) => {
                  const nextSubCategoryId = event.target.value;
                  const scopedProducts = allProducts.filter(
                    (product) =>
                      product.categoryId === editCatalogDraft.categoryId &&
                      product.subCategoryId === nextSubCategoryId,
                  );
                  setEditCatalogDraft((previous) => ({
                    ...previous,
                    subCategoryId: nextSubCategoryId,
                  }));
                  setEditSelectedProductIds(scopedProducts.map((product) => product.id));
                }}
              >
                {editCatalogSubCategories.map((subCategory) => (
                  <MenuItem key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              disableCloseOnSelect
              options={editAutoFilledItems}
              value={selectedProductsForEdit}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(event, nextValue) => {
                setEditSelectedProductIds(nextValue.map((product) => product.id));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product Name"
                  size="small"
                  placeholder={editAutoFilledItems.length > 0 ? "Select products" : "No products available"}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditCatalogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateCatalog}>
            Update Catalog
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2400}
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
    </MotionBox>
  );
};

export default CatalogItemDetailsPage;
