import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SearchRoundedIconRaw from "@mui/icons-material/SearchRounded";
import ViewListRoundedIconRaw from "@mui/icons-material/ViewListRounded";
import TuneRoundedIconRaw from "@mui/icons-material/TuneRounded";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import CatalogItemCard from "../components/CatalogItemCard";
import GridSquaresIcon from "../components/GridSquaresIcon";
import { useCatalogStore } from "../store/catalogStore";
import { filterCatalogItems } from "../utils/catalogSelectors";
import resolveIconComponent from "../utils/resolveIconComponent";

const SearchRoundedIcon = resolveIconComponent(SearchRoundedIconRaw);
const ViewListRoundedIcon = resolveIconComponent(ViewListRoundedIconRaw);
const TuneRoundedIcon = resolveIconComponent(TuneRoundedIconRaw);
const MotionCard = motion(Card);

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
    catalogItems,
    layoutMode,
    filters,
    selectedItems,
    setLayoutMode,
    updateFilters,
    clearFilters,
    toggleItemSelection,
    setSelectedImage,
  } =
    useCatalogStore((state) => ({
      categories: state.categories,
      subCategories: state.subCategories,
      catalogItems: state.catalogItems,
      layoutMode: state.layoutMode,
      filters: state.filters,
      selectedItems: state.selectedItems,
      setLayoutMode: state.setLayoutMode,
      updateFilters: state.updateFilters,
      clearFilters: state.clearFilters,
      toggleItemSelection: state.toggleItemSelection,
      setSelectedImage: state.setSelectedImage,
    }));
  const [searchDraft, setSearchDraft] = useState(filters.search);

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

  const availableSubCategories = useMemo(() => {
    if (filters.categoryId === "all") {
      return subCategories;
    }

    return subCategories.filter((subCategory) => subCategory.categoryId === filters.categoryId);
  }, [filters.categoryId, subCategories]);

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

  const selectedCount = Object.keys(selectedItems).length;
  const activeLayoutMode = layoutToColumns[layoutMode] ? layoutMode : "grid-3";
  const isListMode = activeLayoutMode === "list";
  const quickCategories = useMemo(() => categories.slice(0, 7), [categories]);

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
          mb: 2.4,
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          background:
            "radial-gradient(circle at 0% 30%, rgba(196,181,253,0.38), transparent 42%), radial-gradient(circle at 100% 20%, rgba(186,230,253,0.38), transparent 38%), radial-gradient(circle at 30% 100%, rgba(187,247,208,0.28), transparent 36%), #ffffff",
        }}
      >
        <CardContent sx={{ p: { xs: 2.1, md: 3 } }}>
          <Stack spacing={1.4}>
            <Typography variant="h2" sx={{ lineHeight: 1.02, maxWidth: 900 }}>
              Curated Corporate Gifting Collections
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
              Explore premium gift boxes, signature desk essentials, and seasonal brand showcases built for high-end corporate experiences.
            </Typography>

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
              sx={{ maxWidth: 540, mt: 0.6 }}
            />

            <Stack direction="row" spacing={0.85} useFlexGap flexWrap="wrap">
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
        </CardContent>
      </MotionCard>

      <Card
        sx={{
          mb: 2.4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "12px",
          position: { md: "sticky" },
          top: { md: 102 },
          zIndex: 2,
          bgcolor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <CardContent sx={{ p: { xs: 1.8, md: 2 } }}>
          <Stack
            direction="row"
            spacing={1.2}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
          >
            <Chip icon={<TuneRoundedIcon fontSize="small" />} label="Filters" variant="outlined" />
            <FormControl
              size="small"
              sx={{
                width: { xs: "100%", sm: 220 },
                flexShrink: 0,
              }}
            >
              <InputLabel>Category</InputLabel>
              <Select value={filters.categoryId} label="Category" onChange={handleCategoryChange}>
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem value={category.id} key={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                width: { xs: "100%", sm: 230 },
                flexShrink: 0,
              }}
            >
              <InputLabel>Sub-Category</InputLabel>
              <Select
                value={filters.subCategoryId}
                label="Sub-Category"
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

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                ml: { lg: "auto" },
              }}
            >
              <Chip size="small" color="secondary" label={`${selectedCount} selected`} />
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
                  whiteSpace: "nowrap",
                }}
              >
                Reset
              </Typography>
            </Stack>

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
                  minWidth: 42,
                  width: 42,
                  height: 42,
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
        </CardContent>
      </Card>

      {filteredItems.length === 0 ? (
        <Card sx={{ border: "1px dashed", borderColor: "divider", borderRadius: "12px" }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
              No products match your curation filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adjust category, sub-category, or keyword search to view available premium gifting products.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: { xs: 1.5, md: 2.4 },
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
    </Box>
  );
};

export default CatalogPage;
