import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddRoundedIconRaw from "@mui/icons-material/AddRounded";
import SearchRoundedIconRaw from "@mui/icons-material/SearchRounded";
import ViewListRoundedIconRaw from "@mui/icons-material/ViewListRounded";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CatalogItemCard from "../components/CatalogItemCard";
import GridSquaresIcon from "../components/GridSquaresIcon";
import { useCatalogStore } from "../store/catalogStore";
import { filterCatalogItems } from "../utils/catalogSelectors";
import resolveIconComponent from "../utils/resolveIconComponent";

const AddRoundedIcon = resolveIconComponent(AddRoundedIconRaw);
const SearchRoundedIcon = resolveIconComponent(SearchRoundedIconRaw);
const ViewListRoundedIcon = resolveIconComponent(ViewListRoundedIconRaw);
const MotionCard = motion(Box);
const CONTROL_HEIGHT = 46;

const layoutToColumns = {
  "grid-3": { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" },
  "grid-4": { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" },
  list: { xs: "1fr" },
};

const layoutToggleOptions = [
  { value: "grid-3", icon: <GridSquaresIcon columns={3} size={16} />, label: "Premium Grid" },
  { value: "grid-4", icon: <GridSquaresIcon columns={4} size={16} />, label: "Compact Grid" },
  { value: "list", icon: <ViewListRoundedIcon fontSize="small" />, label: "Editorial List" },
];

const CatalogPage = () => {
  const navigate = useNavigate();
  const {
    categories,
    subCategories,
    allProducts,
    catalogItems,
    catalogLoaded,
    layoutMode,
    filters,
    selectedItems,
    loadCatalogData,
    setLayoutMode,
    updateFilters,
    clearFilters,
    toggleItemSelection,
    setSelectedImage,
    createCatalog,
  } =
    useCatalogStore((state) => ({
      categories: state.categories,
      subCategories: state.subCategories,
      allProducts: state.dbItems,
      catalogItems: state.catalogItems,
      catalogLoaded: state.catalogLoaded,
      layoutMode: state.layoutMode,
      filters: state.filters,
      selectedItems: state.selectedItems,
      loadCatalogData: state.loadCatalogData,
      setLayoutMode: state.setLayoutMode,
      updateFilters: state.updateFilters,
      clearFilters: state.clearFilters,
      toggleItemSelection: state.toggleItemSelection,
      setSelectedImage: state.setSelectedImage,
      createCatalog: state.createCatalog,
    }));
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [createCatalogOpen, setCreateCatalogOpen] = useState(false);
  const [createCatalogDraft, setCreateCatalogDraft] = useState({ categoryId: "", subCategoryId: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search: searchDraft });
    }, 280);

    return () => clearTimeout(timer);
  }, [searchDraft, updateFilters]);

  useEffect(() => {
    if (filters.search !== searchDraft) {
      setSearchDraft(filters.search);
    }
  }, [filters.search]);

  useEffect(() => {
    if (!catalogLoaded) {
      loadCatalogData();
    }
  }, [catalogLoaded, loadCatalogData]);

  const availableSubCategories = useMemo(() => {
    if (filters.categoryId === "all") {
      return subCategories.filter((subCategory) =>
        catalogItems.some((item) => item.subCategoryId === subCategory.id),
      );
    }

    return subCategories.filter(
      (subCategory) =>
        subCategory.categoryId === filters.categoryId &&
        catalogItems.some((item) => item.subCategoryId === subCategory.id),
    );
  }, [filters.categoryId, subCategories, catalogItems]);

  const filteredItems = useMemo(
    () =>
      filterCatalogItems(catalogItems, filters).map((item) => ({
        ...item,
        categoryName: categories.find((category) => category.id === item.categoryId)?.name || "Unknown Category",
        subCategoryName:
          subCategories.find((subCategory) => subCategory.id === item.subCategoryId)?.name || "Unknown Sub-Category",
      })),
    [catalogItems, filters, categories, subCategories],
  );

  const activeLayoutMode = layoutToColumns[layoutMode] ? layoutMode : "grid-3";
  const isListMode = activeLayoutMode === "list";
  const quickCategories = useMemo(
    () =>
      categories
        .filter((category) => catalogItems.some((item) => item.categoryId === category.id))
        .slice(0, 7),
    [categories, catalogItems],
  );
  const categoriesWithItems = useMemo(
    () => categories.filter((category) => allProducts.some((item) => item.categoryId === category.id)),
    [categories, allProducts],
  );
  const createCatalogSubCategories = useMemo(
    () =>
      subCategories.filter(
        (subCategory) =>
          subCategory.categoryId === createCatalogDraft.categoryId &&
          allProducts.some(
            (item) =>
              item.categoryId === createCatalogDraft.categoryId &&
              item.subCategoryId === subCategory.id,
          ),
      ),
    [subCategories, allProducts, createCatalogDraft.categoryId],
  );
  const autoFilledItems = useMemo(
    () =>
      allProducts.filter(
        (item) =>
          item.categoryId === createCatalogDraft.categoryId &&
          item.subCategoryId === createCatalogDraft.subCategoryId,
      ),
    [allProducts, createCatalogDraft.categoryId, createCatalogDraft.subCategoryId],
  );

  const handleOpenCreateCatalog = () => {
    setCreateCatalogDraft({ categoryId: "", subCategoryId: "" });
    setCreateCatalogOpen(true);
  };

  const handleCreateCatalog = async () => {
    if (!createCatalogDraft.categoryId || !createCatalogDraft.subCategoryId) {
      setSnackbar({
        open: true,
        message: "Select category and sub-category to create catalog.",
        severity: "warning",
      });
      return;
    }

    if (autoFilledItems.length === 0) {
      setSnackbar({
        open: true,
        message: "No items found for this category and sub-category.",
        severity: "warning",
      });
      return;
    }

    try {
      await createCatalog({
        categoryId: createCatalogDraft.categoryId,
        subCategoryId: createCatalogDraft.subCategoryId,
      });
      updateFilters({
        search: "",
        categoryId: createCatalogDraft.categoryId,
        subCategoryId: createCatalogDraft.subCategoryId,
      });
      setSearchDraft("");
      setCreateCatalogOpen(false);
      setSnackbar({
        open: true,
        message: `Catalog created with ${autoFilledItems.length} product${autoFilledItems.length === 1 ? "" : "s"}.`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to create catalog.",
        severity: "error",
      });
    }
  };

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    const canUseCurrentSubCategory =
      filters.subCategoryId === "all" ||
      subCategories.some((subCategory) => subCategory.id === filters.subCategoryId && subCategory.categoryId === categoryId);

    updateFilters({
      categoryId,
      subCategoryId: canUseCurrentSubCategory ? filters.subCategoryId : "all",
    });
  };

  return (
    <Box>
      {/* <PageHeader title="Catalog" subtitle="Discover premium gifting collections with curated visual storytelling." eyebrow="Curated Marketplace" /> */}

      <MotionCard
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: "easeOut" }}
        sx={{
          mb: 1.8,
          borderRadius: 0,
          overflow: "visible",
          border: "none",
          backgroundColor: "transparent",
          boxShadow: "none",
        }}
      >
        <Box sx={{ p: { xs: 0, md: 0 } }}>
          <Stack spacing={1.4}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", lg: "flex-start" }}
              spacing={1.8}
            >
              <Box sx={{ maxWidth: 1000 }}>
                <Typography
                  variant="h2"
                  sx={{
                    lineHeight: { xs: 1.08, md: 1.04 },
                    fontSize: { xs: "2.35rem", md: "3.15rem" },
                    letterSpacing: "0.005em",
                    maxWidth: 1000,
                  }}
                >
                  Curated Corporate Gifting Collections
                </Typography>
                {/* <Typography variant="body1" color="text.secondary" sx={{ mt: 1.1, maxWidth: 640 }}>
                  Explore premium gift boxes, signature desk essentials, and seasonal brand showcases built for high-end corporate experiences.
                </Typography> */}
              </Box>
            </Stack>

            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", lg: "center" }}
              useFlexGap
              flexWrap="wrap"
              sx={{ width: "100%" }}
            >
              <TextField
                size="medium"
                placeholder="Search collections, products, or gift concepts"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
                sx={{
                  width: { xs: "100%", lg: "min(30vw, 460px)" },
                  minWidth: { lg: 280 },
                  "& .MuiOutlinedInput-root": {
                    height: CONTROL_HEIGHT,
                  },
                }}
              />
              <FormControl
                size="medium"
                sx={{
                  width: { xs: "100%", sm: 220 },
                  "& .MuiOutlinedInput-root": {
                    height: CONTROL_HEIGHT,
                  },
                }}
              >
                <Select value={filters.categoryId} onChange={handleCategoryChange}>
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories
                    .filter((category) => catalogItems.some((entry) => entry.categoryId === category.id))
                    .map((category) => (
                      <MenuItem value={category.id} key={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <FormControl
                size="medium"
                sx={{
                  width: { xs: "100%", sm: 230 },
                  "& .MuiOutlinedInput-root": {
                    height: CONTROL_HEIGHT,
                  },
                }}
              >
                <Select
                  value={filters.subCategoryId}
                  onChange={(event) => updateFilters({ subCategoryId: event.target.value })}
                >
                  <MenuItem value="all">All Sub-Categories</MenuItem>
                  {availableSubCategories.map((subCategory) => (
                    <MenuItem value={subCategory.id} key={subCategory.id}>
                      {subCategory.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={handleOpenCreateCatalog}
                disabled={categoriesWithItems.length === 0}
                sx={{
                  px: 2.2,
                  height: CONTROL_HEIGHT,
                  minWidth: 180,
                }}
              >
                Create Catalog
              </Button>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: { lg: "auto" } }}>
                <Typography
                  component="button"
                  onClick={() => {
                    clearFilters();
                    setSearchDraft("");
                  }}
                  type="button"
                  sx={{
                    p: 0,
                    m: 0,
                    border: 0,
                    bgcolor: "transparent",
                    color: "text.secondary",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  Reset
                </Typography>

                <ToggleButtonGroup
                  value={activeLayoutMode}
                  exclusive
                  size="small"
                  onChange={(event, value) => {
                    if (value) {
                      setLayoutMode(value);
                    }
                  }}
                  aria-label="catalog-layout-mode"
                  sx={{
                    "& .MuiToggleButton-root": {
                      minWidth: CONTROL_HEIGHT,
                      width: CONTROL_HEIGHT,
                      height: CONTROL_HEIGHT,
                      p: 0.3,
                    },
                  }}
                >
                  {layoutToggleOptions.map((layoutOption) => (
                    <ToggleButton
                      value={layoutOption.value}
                      key={layoutOption.value}
                      aria-label={layoutOption.label}
                      title={layoutOption.label}
                    >
                      {layoutOption.icon}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ maxWidth: 760 }}>
              <Chip
                size="small"
                label="All Collections"
                onClick={() => updateFilters({ categoryId: "all", subCategoryId: "all" })}
                color={filters.categoryId === "all" ? "secondary" : "default"}
                variant={filters.categoryId === "all" ? "filled" : "outlined"}
              />
              {quickCategories.map((category) => (
                <Chip
                  key={category.id}
                  size="small"
                  label={category.name}
                  onClick={() => updateFilters({ categoryId: category.id, subCategoryId: "all" })}
                  color={filters.categoryId === category.id ? "secondary" : "default"}
                  variant={filters.categoryId === category.id ? "filled" : "outlined"}
                />
              ))}
            </Stack>
          </Stack>
        </Box>
      </MotionCard>

      {filteredItems.length === 0 ? (
        <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: "12px", boxShadow: "none" }}>
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
              No products match your curation filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adjust category, sub-category, or keyword search to view available premium gifting products.
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: { xs: 1, md: 1.25 },
            gridTemplateColumns: layoutToColumns[activeLayoutMode],
          }}
        >
          {filteredItems.map((item) => (
            <CatalogItemCard
              key={item.id}
              item={item}
              categoryName={item.categoryName}
              subCategoryName={item.subCategoryName}
              selected={Boolean(selectedItems[item.id])}
              selectedImageIndex={selectedItems[item.id]?.imageIndex ?? 0}
              onToggleSelect={(imageIndex) => toggleItemSelection(item.id, imageIndex)}
              onSelectImage={(imageIndex) => setSelectedImage(item.id, imageIndex)}
              onOpen={() => navigate(`/catalog/items/${item.id}`)}
              compact={activeLayoutMode === "grid-4"}
              listMode={isListMode}
            />
          ))}
        </Box>
      )}

      <Dialog open={createCatalogOpen} onClose={() => setCreateCatalogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Catalog</DialogTitle>
        <DialogContent>
          <Stack spacing={1.3} sx={{ mt: 0.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Category Selection</InputLabel>
              <Select
                value={createCatalogDraft.categoryId}
                label="Category Selection"
                onChange={(event) =>
                  setCreateCatalogDraft({
                    categoryId: event.target.value,
                    subCategoryId: "",
                  })
                }
              >
                {categoriesWithItems.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth disabled={!createCatalogDraft.categoryId}>
              <InputLabel>Sub-Category Selection</InputLabel>
              <Select
                value={createCatalogDraft.subCategoryId}
                label="Sub-Category Selection"
                onChange={(event) =>
                  setCreateCatalogDraft((previous) => ({
                    ...previous,
                    subCategoryId: event.target.value,
                  }))
                }
              >
                {createCatalogSubCategories.map((subCategory) => (
                  <MenuItem key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Product Name (Auto Filled)"
              size="small"
              fullWidth
              multiline
              minRows={3}
              value={autoFilledItems.length > 0 ? autoFilledItems.map((item) => item.name).join("\n") : ""}
              placeholder="Products will auto-fill after selecting category and sub-category."
              InputProps={{ readOnly: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateCatalogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCatalog}>
            Create Catalog
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
    </Box>
  );
};

export default CatalogPage;
