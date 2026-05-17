import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIconRaw from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIconRaw from "@mui/icons-material/RadioButtonUncheckedRounded";
import { AnimatePresence, motion } from "framer-motion";
import resolveIconComponent from "../utils/resolveIconComponent";

const CheckCircleRoundedIcon = resolveIconComponent(CheckCircleRoundedIconRaw);
const RadioButtonUncheckedRoundedIcon = resolveIconComponent(RadioButtonUncheckedRoundedIconRaw);
const MotionCard = motion(Card);
const FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><defs><linearGradient id="bg" x1="0" x2="1"><stop offset="0" stop-color="#ddd6fe"/><stop offset="1" stop-color="#e0f2fe"/></linearGradient></defs><rect width="1200" height="900" fill="url(#bg)"/><rect x="160" y="160" width="880" height="580" rx="42" fill="#fff" stroke="#c4b5fd" stroke-width="8"/><rect x="250" y="260" width="700" height="120" rx="24" fill="#ede9fe"/><rect x="320" y="430" width="560" height="26" rx="13" fill="#fbcfe8"/><rect x="340" y="480" width="520" height="26" rx="13" fill="#bbf7d0"/><text x="600" y="680" text-anchor="middle" font-size="52" font-family="Arial, Helvetica, sans-serif" fill="#44403c">Gift Catalog</text></svg>',
)}`;

const CatalogItemCard = ({
  item,
  categoryName,
  subCategoryName,
  selected,
  selectedImageIndex,
  onToggleSelect,
  onSelectImage,
  onOpen = () => {},
  compact = false,
  listMode = false,
}) => {
  const [previewIndex, setPreviewIndex] = useState(selectedImageIndex || 0);
  const isCompactCard = compact && !listMode;
  const slideDurationMs = isCompactCard ? 2400 : 2800;

  useEffect(() => {
    if (typeof selectedImageIndex === "number") {
      setPreviewIndex(selectedImageIndex);
    }
  }, [selectedImageIndex]);

  useEffect(() => {
    if (item.images.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setPreviewIndex((previousIndex) => {
        const nextIndex = (previousIndex + 1) % item.images.length;
        if (selected) {
          onSelectImage(nextIndex);
        }
        return nextIndex;
      });
    }, slideDurationMs);

    return () => window.clearInterval(timer);
  }, [item.images.length, onSelectImage, selected, slideDurationMs]);

  const currentImage = item.images[previewIndex] || item.images[0];

  const handleSelect = (event) => {
    event.stopPropagation();
    onToggleSelect(previewIndex);
    onSelectImage(previewIndex);
  };

  const handleThumbnailClick = (event, index) => {
    event.stopPropagation();
    setPreviewIndex(index);
    if (selected) {
      onSelectImage(index);
    }
  };

  const handleImageError = (event) => {
    if (event.currentTarget.src !== FALLBACK_IMAGE) {
      event.currentTarget.src = FALLBACK_IMAGE;
    }
  };

  if (listMode) {
    return (
      <MotionCard
        whileHover={{ y: -2 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={onOpen}
        role="button"
        tabIndex={0}
        sx={{
          borderRadius: "12px",
          border: "1px solid",
          borderColor: selected ? "primary.main" : "divider",
          overflow: "hidden",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.8} sx={{ p: 1.8 }}>
          <Box
            sx={{
              width: { xs: "100%", md: 240 },
              height: 164,
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <AnimatePresence initial={false} mode="sync">
              <motion.img
                key={`${item.id}-${previewIndex}`}
                src={currentImage}
                alt={item.name}
                onError={handleImageError}
                initial={{ opacity: 0.12 }}
                animate={{ opacity: 1, scale: [1.04, 1] }}
                exit={{ opacity: 0.12 }}
                transition={{ duration: 0.56, ease: "easeOut" }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </AnimatePresence>
          </Box>

          <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" sx={{ lineHeight: 1.1 }}>
                {item.name}
              </Typography>
              <IconButton onClick={handleSelect} size="small">
                {selected ? <CheckCircleRoundedIcon color="primary" /> : <RadioButtonUncheckedRoundedIcon />}
              </IconButton>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
            <Stack direction="row" spacing={0.9} flexWrap="wrap">
              <Chip size="small" label={categoryName} />
              <Chip size="small" variant="outlined" label={subCategoryName} />
            </Stack>
            <Stack direction="row" spacing={0.8} sx={{ pt: 0.3 }}>
              {item.images.map((image, index) => (
                <Box
                  key={`${item.id}-thumb-${index}`}
                  component="button"
                  onClick={(event) => handleThumbnailClick(event, index)}
                  type="button"
                  sx={{
                    p: 0,
                    width: 44,
                    height: 44,
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: previewIndex === index ? "primary.main" : "divider",
                    cursor: "pointer",
                    bgcolor: "background.paper",
                  }}
                >
                  <Box
                    component="img"
                    src={image}
                    alt={`${item.name} ${index + 1}`}
                    onError={handleImageError}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </MotionCard>
    );
  }

  return (
    <MotionCard
      whileHover={{ y: -4 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      sx={{
        borderRadius: "12px",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        overflow: "hidden",
        cursor: "pointer",
        backgroundColor: "background.paper",
        boxShadow: selected ? "0 12px 24px rgba(196,181,253,0.28)" : "0 8px 20px rgba(186,230,253,0.2)",
      }}
    >
      <Box sx={{ p: 1.1, pb: 0 }}>
        <Box
          sx={{
            width: "100%",
            aspectRatio: isCompactCard ? "4 / 3.1" : "4 / 3.25",
            borderRadius: "10px",
            overflow: "hidden",
            position: "relative",
            backgroundColor: "#f5f5f4",
          }}
        >
          <IconButton
            onClick={handleSelect}
            size="small"
            sx={{
              position: "absolute",
              top: 9,
              right: 9,
              zIndex: 2,
              bgcolor: "rgba(255,255,255,0.9)",
              border: "1px solid",
              borderColor: selected ? "primary.main" : "divider",
            }}
          >
            {selected ? <CheckCircleRoundedIcon fontSize="small" color="primary" /> : <RadioButtonUncheckedRoundedIcon fontSize="small" />}
          </IconButton>
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={`${item.id}-${previewIndex}`}
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.2 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ position: "absolute", inset: 0 }}
            >
              <motion.img
                src={currentImage}
                alt={item.name}
                loading="lazy"
                onError={handleImageError}
                animate={{ scale: [1.05, 1.01] }}
                transition={{ duration: slideDurationMs / 1000, ease: "linear" }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>

      <Stack spacing={1} sx={{ px: 1.6, pt: 1.2, pb: 1.3, textAlign: "center" }}>
        <Typography variant="h5" sx={{ lineHeight: 1.15, fontSize: isCompactCard ? 29 : 33 }}>
          {item.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: isCompactCard ? 2 : 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.45,
            minHeight: isCompactCard ? 40 : 58,
          }}
        >
          {item.description}
        </Typography>
        <Stack direction="row" spacing={0.75} justifyContent="center" flexWrap="wrap">
          <Chip size="small" label={categoryName} />
          <Chip size="small" variant="outlined" label={subCategoryName} />
        </Stack>
      </Stack>
    </MotionCard>
  );
};

export default CatalogItemCard;
