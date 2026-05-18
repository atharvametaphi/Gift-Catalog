import { useMemo } from "react";
import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useCatalogStore } from "../store/catalogStore";
import { byCreatedAtDesc } from "../utils/catalogSelectors";

const MotionCard = motion(Card);
const SURFACE_RADIUS = "6px";

const DashboardPage = () => {
  const { categories, subCategories, dbItems, createdCatalogs, catalogItems } = useCatalogStore((state) => ({
    categories: state.categories,
    subCategories: state.subCategories,
    dbItems: state.dbItems,
    createdCatalogs: state.createdCatalogs,
    catalogItems: state.catalogItems,
  }));

  const overviewStats = useMemo(
    () => [
      { title: "Total Catalogues", value: createdCatalogs.length },
      { title: "Total Products", value: dbItems.length },
      { title: "Total Categories", value: categories.length },
      { title: "Total Sub-Categories", value: subCategories.length },
    ],
    [createdCatalogs.length, dbItems.length, categories.length, subCategories.length],
  );

  const recentItems = useMemo(() => [...catalogItems].sort(byCreatedAtDesc).slice(0, 4), [catalogItems]);
  const featuredItem = recentItems[0] || catalogItems[0];

  const featuredCollections = useMemo(
    () =>
      categories.slice(0, 4).map((category) => {
        const collectionImage =
          catalogItems.find((item) => item.categoryId === category.id)?.images?.[0] || featuredItem?.images?.[0] || "";

        return {
          id: category.id,
          name: category.name,
          collectionImage,
        };
      }),
    [categories, catalogItems, featuredItem],
  );

  return (
    <Box>
      <MotionCard
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: "easeOut" }}
        sx={{
          mb: 2.4,
          borderRadius: SURFACE_RADIUS,
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
              "linear-gradient(104deg, rgba(250, 249, 246, 0.96) 2%, rgba(244, 238, 226, 0.84) 52%, rgba(233, 223, 199, 0.66) 100%)",
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
          <Grid container spacing={1.1} sx={{ mt: 2.2 }}>
            <Grid item xs={12} sm="auto">
              <Button component={RouterLink} to="/catalog" variant="contained" color="secondary" fullWidth>
                Explore Catalog
              </Button>
            </Grid>
            <Grid item xs={12} sm="auto">
              <Button
                component={RouterLink}
                to="/generate-pdf"
                variant="outlined"
                sx={{ color: "text.primary", borderColor: "divider" }}
                fullWidth
              >
                Build PDF Proposal
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </MotionCard>

      <Grid container spacing={1.6} sx={{ mb: 2.2 }}>
        {overviewStats.map((metric) => (
          <Grid item xs={12} sm={6} lg={3} key={metric.title}>
            <Card sx={{ borderRadius: SURFACE_RADIUS, border: "1px solid", borderColor: "divider", height: "100%" }}>
              <CardContent sx={{ p: 1.7 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {metric.title}
                </Typography>
                <Typography variant="h4" sx={{ mt: 0.4 }}>
                  {metric.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ mb: 1.25 }}>
        Featured Collections
      </Typography>
      <Grid container spacing={1.8}>
        {featuredCollections.map((collection) => (
          <Grid item xs={12} sm={6} key={collection.id}>
            <Card
              sx={{
                borderRadius: SURFACE_RADIUS,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" sx={{ mb: 1.3 }}>
          Recently Added
        </Typography>
        <Grid container spacing={1.8}>
          {recentItems.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.id}>
              <Card sx={{ borderRadius: SURFACE_RADIUS, border: "1px solid", borderColor: "divider", overflow: "hidden", height: "100%" }}>
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
