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
import AddRoundedIconRaw from "@mui/icons-material/AddRounded";
import MoreVertRoundedIconRaw from "@mui/icons-material/MoreVertRounded";
import { Controller, useForm } from "react-hook-form";
import { useCatalogStore } from "../store/catalogStore";
import resolveIconComponent from "../utils/resolveIconComponent";

const AddRoundedIcon = resolveIconComponent(AddRoundedIconRaw);
const MoreVertRoundedIcon = resolveIconComponent(MoreVertRoundedIconRaw);

const isDatabaseId = (value) => /^[a-fA-F0-9]{24}$/.test(value || "");

const SubCategoriesPage = () => {
  const { subCategories, dbCategories, addSubCategory, updateSubCategory, deleteSubCategory } = useCatalogStore((state) => ({
    subCategories: state.subCategories,
    dbCategories: state.dbCategories,
    addSubCategory: state.addSubCategory,
    updateSubCategory: state.updateSubCategory,
    deleteSubCategory: state.deleteSubCategory,
  }));
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [actionRow, setActionRow] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      categoryId: "",
    },
  });

  const subCategoryRows = useMemo(
    () =>
      subCategories.map((subCategory) => ({
        ...subCategory,
        dbRecord: isDatabaseId(subCategory.id),
      })),
    [subCategories],
  );

  const closeDialog = () => {
    if (submitting) {
      return;
    }

    setOpenDialog(false);
    setDialogMode("add");
    setActionRow(null);
    reset({ name: "", categoryId: "" });
  };

  const openAddDialog = () => {
    setDialogMode("add");
    setActionRow(null);
    reset({ name: "", categoryId: "" });
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
    });
    setOpenDialog(true);
    setActionAnchorEl(null);
  };

  const handleDeleteClick = async () => {
    if (!actionRow?.dbRecord) {
      return;
    }

    const confirmed = window.confirm(`Delete sub-category "${actionRow.name}"?`);
    if (!confirmed) {
      setActionAnchorEl(null);
      return;
    }

    setSubmitting(true);
    try {
      await deleteSubCategory(actionRow.id);
      setSnackbar({
        open: true,
        message: "Sub-Category deleted successfully.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to delete sub-category.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
      setActionAnchorEl(null);
      setActionRow(null);
    }
  };

  const onSubmit = async (values) => {
    setSubmitting(true);

    try {
      if (dialogMode === "edit" && actionRow?.dbRecord) {
        await updateSubCategory({
          id: actionRow.id,
          name: values.name,
          categoryId: values.categoryId,
        });
        setSnackbar({
          open: true,
          message: "Sub-Category updated successfully.",
          severity: "success",
        });
      } else {
        await addSubCategory({
          name: values.name,
          categoryId: values.categoryId,
        });
        setSnackbar({
          open: true,
          message: "Sub-Category added successfully.",
          severity: "success",
        });
      }

      setOpenDialog(false);
      setDialogMode("add");
      setActionRow(null);
      reset({ name: "", categoryId: "" });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || `Failed to ${dialogMode} sub-category.`,
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
              Sub-Category Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              sx={{ whiteSpace: "nowrap" }}
              onClick={openAddDialog}
            >
              Add Sub-Category
            </Button>
          </Stack>
          {/* {dbCategories.length === 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Create a category first, then add sub-categories.
            </Typography>
          ) : null} */}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === "edit" ? "Edit Sub-Category" : "Add Sub-Category"}</DialogTitle>
        <Stack component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Sub-Category name is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Sub-Category Name"
                  size="small"
                  fullWidth
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
                  <Select {...field} label="Category Selection">
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
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" startIcon={<AddRoundedIcon />} disabled={submitting}>
              {submitting ? (dialogMode === "edit" ? "Saving..." : "Adding...") : dialogMode === "edit" ? "Save Changes" : "Add Sub-Category"}
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
                <TableCell sx={{ fontWeight: 700 }}>Sub-Category Name</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 56 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subCategoryRows.map((subCategory) => (
                <TableRow key={subCategory.id}>
                  <TableCell>{subCategory.name}</TableCell>
                  <TableCell>
                    <Tooltip title={subCategory.dbRecord ? "Actions" : "Dummy data row"}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            setActionAnchorEl(event.currentTarget);
                            setActionRow(subCategory);
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

export default SubCategoriesPage;
