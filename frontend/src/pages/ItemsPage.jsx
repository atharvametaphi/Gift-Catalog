import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddPhotoAlternateRoundedIconRaw from "@mui/icons-material/AddPhotoAlternateRounded";
import AddRoundedIconRaw from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIconRaw from "@mui/icons-material/DeleteOutlineRounded";
import MoreVertRoundedIconRaw from "@mui/icons-material/MoreVertRounded";
import { Controller, useForm } from "react-hook-form";
import { useCatalogStore } from "../store/catalogStore";
import resolveIconComponent from "../utils/resolveIconComponent";

const AddPhotoAlternateRoundedIcon = resolveIconComponent(AddPhotoAlternateRoundedIconRaw);
const AddRoundedIcon = resolveIconComponent(AddRoundedIconRaw);
const DeleteOutlineRoundedIcon = resolveIconComponent(DeleteOutlineRoundedIconRaw);
const MoreVertRoundedIcon = resolveIconComponent(MoreVertRoundedIconRaw);

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });

const isDatabaseId = (value) => /^[a-fA-F0-9]{24}$/.test(value || "");

const ItemsPage = () => {
  const { dbCategories, dbSubCategories, catalogItems, addItem, updateItem, deleteItem } = useCatalogStore((state) => ({
    dbCategories: state.dbCategories,
    dbSubCategories: state.dbSubCategories,
    catalogItems: state.catalogItems,
    addItem: state.addItem,
    updateItem: state.updateItem,
    deleteItem: state.deleteItem,
  }));
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [actionRow, setActionRow] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      name: "",
      categoryId: "",
      subCategoryId: "",
    },
  });

  const selectedCategoryId = watch("categoryId");

  const itemRows = useMemo(
    () =>
      catalogItems.map((item) => ({
        ...item,
        dbRecord: isDatabaseId(item.id),
      })),
    [catalogItems],
  );

  const availableSubCategories = useMemo(
    () =>
      dbSubCategories.filter((subCategory) =>
        selectedCategoryId ? subCategory.categoryId === selectedCategoryId : true,
      ),
    [dbSubCategories, selectedCategoryId],
  );

  const handleFileSelection = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    try {
      const imageUrls = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
      const nextFiles = imageUrls.map((url, index) => ({
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
        name: files[index].name,
        url,
      }));
      setUploadedImages((previous) => [...previous, ...nextFiles]);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Unable to load one or more images.",
        severity: "error",
      });
    }

    event.target.value = "";
  };

  const handleRemoveImage = (imageId) => {
    setUploadedImages((previous) => previous.filter((image) => image.id !== imageId));
  };

  const closeDialog = () => {
    if (submitting) {
      return;
    }

    setOpenDialog(false);
    setDialogMode("add");
    setActionRow(null);
    reset({ name: "", categoryId: "", subCategoryId: "" });
    setUploadedImages([]);
  };

  const openAddDialog = () => {
    setDialogMode("add");
    setActionRow(null);
    reset({ name: "", categoryId: "", subCategoryId: "" });
    setUploadedImages([]);
    setOpenDialog(true);
  };

  const handleEditClick = () => {
    if (!actionRow?.dbRecord) {
      return;
    }

    setDialogMode("edit");
    reset({
      name: actionRow.name,
      categoryId: actionRow.categoryId || "",
      subCategoryId: actionRow.subCategoryId || "",
    });
    setUploadedImages(
      (actionRow.images || []).map((url, index) => ({
        id: `existing-${index}-${Math.random().toString(36).slice(2, 6)}`,
        name: `Image ${index + 1}`,
        url,
      })),
    );
    setOpenDialog(true);
    setActionAnchorEl(null);
  };

  const handleDeleteClick = async () => {
    if (!actionRow?.dbRecord) {
      return;
    }

    const confirmed = window.confirm(`Delete item "${actionRow.name}"?`);
    if (!confirmed) {
      setActionAnchorEl(null);
      return;
    }

    setSubmitting(true);
    try {
      await deleteItem(actionRow.id);
      setSnackbar({
        open: true,
        message: "Item deleted successfully.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to delete item.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
      setActionAnchorEl(null);
      setActionRow(null);
    }
  };

  const onSubmit = async (values) => {
    if (uploadedImages.length === 0) {
      setSnackbar({
        open: true,
        message: "Please add at least one photo for the item.",
        severity: "warning",
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: values.name,
        categoryId: values.categoryId,
        subCategoryId: values.subCategoryId,
        images: uploadedImages.map((image) => image.url),
      };

      if (dialogMode === "edit" && actionRow?.dbRecord) {
        await updateItem({
          id: actionRow.id,
          ...payload,
          description: actionRow.description || "",
        });
        setSnackbar({
          open: true,
          message: "Item updated successfully.",
          severity: "success",
        });
      } else {
        await addItem(payload);
        setSnackbar({
          open: true,
          message: "Item added successfully.",
          severity: "success",
        });
      }

      setOpenDialog(false);
      setDialogMode("add");
      setActionRow(null);
      reset({ name: "", categoryId: "", subCategoryId: "" });
      setUploadedImages([]);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || `Failed to ${dialogMode} item.`,
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 2.3, border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 2.3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Item Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openAddDialog}
            >
              Add Item
            </Button>
          </Stack>
          {/* {dbCategories.length === 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Create a category first.
            </Typography>
          ) : null} */}
          {dbCategories.length > 0 && dbSubCategories.length === 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Create a sub-category first, then add items.
            </Typography>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{dialogMode === "edit" ? "Edit Item" : "Add Item"}</DialogTitle>
        <Stack component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={1.3}>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Item name is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Item Name"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="categoryId"
                control={control}
                rules={{ required: "Category selection is required" }}
                render={({ field, fieldState }) => (
                  <FormControl size="small" fullWidth error={Boolean(fieldState.error)}>
                    <InputLabel>Category Selection</InputLabel>
                    <Select
                      {...field}
                      label="Category Selection"
                      onChange={(event) => {
                        field.onChange(event);
                        const nextCategoryId = event.target.value;
                        const currentSubCategoryId = watch("subCategoryId");
                        const validSubCategory = dbSubCategories.some(
                          (subCategory) =>
                            subCategory.id === currentSubCategoryId && subCategory.categoryId === nextCategoryId,
                        );
                        if (!validSubCategory) {
                          setValue("subCategoryId", "");
                        }
                      }}
                    >
                      {dbCategories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldState.error ? (
                      <Typography variant="caption" color="error" sx={{ pl: 1.7, pt: 0.5 }}>
                        {fieldState.error.message}
                      </Typography>
                    ) : null}
                  </FormControl>
                )}
              />

              <Controller
                name="subCategoryId"
                control={control}
                rules={{ required: "Sub-category selection is required" }}
                render={({ field, fieldState }) => (
                  <FormControl size="small" fullWidth error={Boolean(fieldState.error)}>
                    <InputLabel>Sub-category Selection</InputLabel>
                    <Select {...field} label="Sub-category Selection">
                      {availableSubCategories.map((subCategory) => (
                        <MenuItem key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldState.error ? (
                      <Typography variant="caption" color="error" sx={{ pl: 1.7, pt: 0.5 }}>
                        {fieldState.error.message}
                      </Typography>
                    ) : null}
                  </FormControl>
                )}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.1} alignItems={{ sm: "center" }}>
                <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateRoundedIcon />} disabled={submitting}>
                  Add Photo/Photos
                  <input type="file" hidden accept="image/*" multiple onChange={handleFileSelection} />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  JPG, PNG, or WebP. You can add multiple files.
                </Typography>
              </Stack>

              {uploadedImages.length > 0 ? (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {uploadedImages.map((image) => (
                    <Box
                      key={image.id}
                      sx={{
                        width: 96,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1.4,
                        overflow: "hidden",
                        bgcolor: "background.paper",
                      }}
                    >
                      <Box
                        component="img"
                        src={image.url}
                        alt={image.name}
                        sx={{
                          width: "100%",
                          height: 72,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 0.5, py: 0.35 }}>
                        <Typography variant="caption" noWrap sx={{ maxWidth: 60 }}>
                          {image.name}
                        </Typography>
                        <IconButton size="small" onClick={() => handleRemoveImage(image.id)}>
                          <DeleteOutlineRoundedIcon fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" startIcon={<AddRoundedIcon />} disabled={submitting}>
              {submitting ? (dialogMode === "edit" ? "Saving..." : "Adding...") : dialogMode === "edit" ? "Save Changes" : "Add Item"}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>

      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Table
            size="small"
            sx={{
              "& .MuiTableCell-root": {
                borderColor: "divider",
                px: 1.25,
                py: 0.9,
              },
              "& .MuiTableCell-root + .MuiTableCell-root": {
                borderLeft: "1px solid",
                borderLeftColor: "divider",
              },
              "& .MuiTableHead-root .MuiTableCell-root": {
                borderBottomWidth: 1.5,
                borderBottomStyle: "solid",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, minWidth: 86 }}>Preview</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Item Name</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 56 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itemRows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Box
                      component="img"
                      src={item.images?.[0] || ""}
                      alt={item.name}
                      sx={{
                        width: 56,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        display: "block",
                      }}
                    />
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Tooltip title={item.dbRecord ? "Actions" : "Dummy data row"}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            setActionAnchorEl(event.currentTarget);
                            setActionRow(item);
                          }}
                        >
                          <MoreVertRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={() => {
          setActionAnchorEl(null);
          setActionRow(null);
        }}
      >
        <MenuItem onClick={handleEditClick} disabled={!actionRow?.dbRecord}>
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} disabled={!actionRow?.dbRecord}>
          Delete
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2400}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ItemsPage;
