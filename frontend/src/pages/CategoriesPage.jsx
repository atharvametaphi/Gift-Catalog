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
  IconButton,
  Menu,
  MenuItem,
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
import { Controller, useForm } from "react-hook-form";
import AddRoundedIconRaw from "@mui/icons-material/AddRounded";
import MoreVertRoundedIconRaw from "@mui/icons-material/MoreVertRounded";
import { useCatalogStore } from "../store/catalogStore";
import resolveIconComponent from "../utils/resolveIconComponent";

const AddRoundedIcon = resolveIconComponent(AddRoundedIconRaw);
const MoreVertRoundedIcon = resolveIconComponent(MoreVertRoundedIconRaw);

const isDatabaseId = (value) => /^[a-fA-F0-9]{24}$/.test(value || "");

const CategoriesPage = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCatalogStore((state) => ({
    categories: state.categories,
    addCategory: state.addCategory,
    updateCategory: state.updateCategory,
    deleteCategory: state.deleteCategory,
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
    },
  });

  const categoryRows = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        dbRecord: isDatabaseId(category.id),
      })),
    [categories],
  );

  const closeDialog = () => {
    if (submitting) {
      return;
    }

    setOpenDialog(false);
    setDialogMode("add");
    setActionRow(null);
    reset({ name: "" });
  };

  const openAddDialog = () => {
    setDialogMode("add");
    setActionRow(null);
    reset({ name: "" });
    setOpenDialog(true);
  };

  const handleEditClick = () => {
    if (!actionRow?.dbRecord) {
      return;
    }

    setDialogMode("edit");
    reset({ name: actionRow.name });
    setOpenDialog(true);
    setActionAnchorEl(null);
  };

  const handleDeleteClick = async () => {
    if (!actionRow?.dbRecord) {
      return;
    }

    const confirmed = window.confirm(`Delete category "${actionRow.name}"?`);
    if (!confirmed) {
      setActionAnchorEl(null);
      return;
    }

    setSubmitting(true);
    try {
      await deleteCategory(actionRow.id);
      setSnackbar({
        open: true,
        message: "Category deleted successfully.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to delete category.",
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
        await updateCategory({
          id: actionRow.id,
          name: values.name,
        });
        setSnackbar({
          open: true,
          message: "Category updated successfully.",
          severity: "success",
        });
      } else {
        await addCategory({
          name: values.name,
        });
        setSnackbar({
          open: true,
          message: "Category added successfully.",
          severity: "success",
        });
      }

      setOpenDialog(false);
      setDialogMode("add");
      setActionRow(null);
      reset({ name: "" });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || `Failed to ${dialogMode} category.`,
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
              Category Management
            </Typography>
            <Button variant="contained" startIcon={<AddRoundedIcon />} sx={{ whiteSpace: "nowrap" }} onClick={openAddDialog}>
              Add Category
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === "edit" ? "Edit Category" : "Add Category"}</DialogTitle>
        <Stack component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Category name is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Category Name"
                  size="small"
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" startIcon={<AddRoundedIcon />} disabled={submitting}>
              {submitting ? (dialogMode === "edit" ? "Saving..." : "Adding...") : dialogMode === "edit" ? "Save Changes" : "Add Category"}
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
                <TableCell sx={{ fontWeight: 700 }}>Category Name</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 56 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoryRows.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    <Tooltip title={category.dbRecord ? "Actions" : "Dummy data row"}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            setActionAnchorEl(event.currentTarget);
                            setActionRow(category);
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

export default CategoriesPage;
