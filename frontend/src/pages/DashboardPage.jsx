import { useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import CategoryOutlinedIconRaw from "@mui/icons-material/CategoryOutlined";
import LayersOutlinedIconRaw from "@mui/icons-material/LayersOutlined";
import Inventory2OutlinedIconRaw from "@mui/icons-material/Inventory2Outlined";
import ArrowForwardRoundedIconRaw from "@mui/icons-material/ArrowForwardRounded";
import PictureAsPdfRoundedIconRaw from "@mui/icons-material/PictureAsPdfRounded";
import AutoAwesomeMosaicOutlinedIconRaw from "@mui/icons-material/AutoAwesomeMosaicOutlined";
import CollectionsBookmarkRoundedIconRaw from "@mui/icons-material/CollectionsBookmarkRounded";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import { useCatalogStore } from "../store/catalogStore";
import { byCreatedAtDesc } from "../utils/catalogSelectors";
import resolveIconComponent from "../utils/resolveIconComponent";

const CategoryOutlinedIcon = resolveIconComponent(CategoryOutlinedIconRaw);
const LayersOutlinedIcon = resolveIconComponent(LayersOutlinedIconRaw);
const Inventory2OutlinedIcon = resolveIconComponent(Inventory2OutlinedIconRaw);
const ArrowForwardRoundedIcon = resolveIconComponent(ArrowForwardRoundedIconRaw);
const PictureAsPdfRoundedIcon = resolveIconComponent(PictureAsPdfRoundedIconRaw);
const AutoAwesomeMosaicOutlinedIcon = resolveIconComponent(AutoAwesomeMosaicOutlinedIconRaw);
const CollectionsBookmarkRoundedIcon = resolveIconComponent(CollectionsBookmarkRoundedIconRaw);
const MotionCard = motion(Card);

const DashboardPage = () => {
  const { categories, subCategories, catalogItems, selectedCount } = useCatalogStore((state) => ({
    categories: state.categories,
    subCategories: state.subCategories,
    catalogItems: state.catalogItems,
    selectedCount: Object.keys(state.selectedItems).length,
  }));

  const stats = useMemo(
    () => [
      { title: "Collections", value: categories.length, icon: CategoryOutlinedIcon },
      { title: "Curated Lines", value: subCategories.length, icon: LayersOutlinedIcon },
      { title: "Products", value: catalogItems.length, icon: Inventory2OutlinedIcon },
    ],
    [categories.length, subCategories.length, catalogItems.length],
  );

  const recentItems = useMemo(() => [...catalogItems].sort(byCreatedAtDesc).slice(0, 4), [catalogItems]);
  const featuredItem = recentItems[0] || catalogItems[0];

  const featuredCollections = useMemo(
    () =>
      categories.slice(0, 4).map((category) => {
        const itemCount = catalogItems.filter((item) => item.categoryId === category.id).length;
        const collectionImage =
          catalogItems.find((item) => item.categoryId === category.id)?.images?.[0] || featuredItem?.images?.[0] || "";

        return {
          id: category.id,
          name: category.name,
          itemCount,
          collectionImage,
        };
      }),
    [categories, catalogItems, featuredItem],
  );

  return (
    <Box>
      <PageHeader
        title="Gifting Studio"
        // subtitle="A curated brand workspace for premium corporate gifting collections and proposal-ready product experiences."
        // eyebrow="Studio Overview"
      />

      <Grid container spacing={2.4}>
        <Grid item xs={12} xl={8}>
          <MotionCard
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: "easeOut" }}
            sx={{
              mb: 2.4,
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              minHeight: 304,
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage: featuredItem?.images?.[0] ? `url(${featuredItem.images[0]})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: "scale(1.02)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(104deg, rgba(250,250,249,0.95) 2%, rgba(233,225,254,0.76) 52%, rgba(186,230,253,0.58) 100%)",
              }}
            />
            <CardContent
              sx={{
                p: { xs: 2.2, md: 3.2 },
                position: "relative",
                zIndex: 1,
                color: "text.primary",
                maxWidth: 660,
              }}
            >
              <Typography variant="caption" sx={{ letterSpacing: "0.17em", textTransform: "uppercase", opacity: 0.82 }}>
                Featured Collection
              </Typography>
              <Typography variant="h2" sx={{ mt: 0.7, mb: 1, lineHeight: 1.02 }}>
                Curated Corporate Gifting Collections
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 540 }}>
                Showcase premium gifts with editorial visuals, subtle luxury styling, and proposal-ready selection flow.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.1} sx={{ mt: 2.2 }}>
                <Button component={RouterLink} to="/catalog" variant="contained" color="secondary">
                  Explore Catalog
                </Button>
                <Button component={RouterLink} to="/generate-pdf" variant="outlined" sx={{ color: "text.primary", borderColor: "divider" }}>
                  Build PDF Proposal
                </Button>
              </Stack>
            </CardContent>
          </MotionCard>

          <Typography variant="h5" sx={{ mb: 1.25 }}>
            Featured Collections
          </Typography>
          <Grid container spacing={1.8}>
            {featuredCollections.map((collection) => (
              <Grid item xs={12} sm={6} key={collection.id}>
                <Card sx={{ borderRadius: 3.4, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                  <Box
                    sx={{
                      height: 160,
                      backgroundImage: collection.collectionImage ? `url(${collection.collectionImage})` : "none",
                      backgroundColor: "background.default",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h5" sx={{ lineHeight: 1.1 }}>
                      {collection.name}
                    </Typography>
                    <Chip
                      size="small"
                      icon={<CollectionsBookmarkRoundedIcon fontSize="small" />}
                      label={`${collection.itemCount} curated products`}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} xl={4}>
          <Stack spacing={1.8}>
            {stats.map((card) => {
              const Icon = card.icon;

              return (
                <Card key={card.title} sx={{ borderRadius: 3.2, border: "1px solid", borderColor: "divider" }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="caption" sx={{ letterSpacing: "0.14em", textTransform: "uppercase", color: "text.secondary" }}>
                          {card.title}
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 0.4 }}>
                          {card.value}
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1.1, borderRadius: 999, bgcolor: "rgba(196,181,253,0.24)" }}>
                        <Icon sx={{ color: "primary.main" }} />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}

            <Card sx={{ borderRadius: 3.2, border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: 2.3 }}>
                <Typography variant="h5" sx={{ mb: 0.8 }}>
                  Proposal Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCount} items are currently selected for your PDF proposal builder.
                </Typography>
                <Stack spacing={1.1} sx={{ mt: 2.1 }}>
                  <Button
                    component={RouterLink}
                    to="/catalog"
                    variant="contained"
                    startIcon={<AutoAwesomeMosaicOutlinedIcon />}
                    endIcon={<ArrowForwardRoundedIcon />}
                  >
                    Browse Catalog
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/generate-pdf"
                    variant="outlined"
                    startIcon={<PictureAsPdfRoundedIcon />}
                    endIcon={<ArrowForwardRoundedIcon />}
                  >
                    Open PDF Builder
                  </Button>
                  <Button component={RouterLink} to="/items" variant="text" endIcon={<ArrowForwardRoundedIcon />}>
                    Manage Item Library
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" sx={{ mb: 1.3 }}>
          Recently Added
        </Typography>
        <Grid container spacing={1.8}>
          {recentItems.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.id}>
              <Card sx={{ borderRadius: 3.2, border: "1px solid", borderColor: "divider", overflow: "hidden", height: "100%" }}>
                <Box
                  sx={{
                    height: 145,
                    backgroundImage: `url(${item.images?.[0] || ""})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <CardContent sx={{ p: 1.8 }}>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1.25 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Added {new Date(item.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardPage;
