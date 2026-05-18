import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
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
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import AddRoundedIconRaw from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIconRaw from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIconRaw from "@mui/icons-material/EditRounded";
import MoreVertRoundedIconRaw from "@mui/icons-material/MoreVertRounded";
import { userService } from "../services/userService";
import resolveIconComponent from "../utils/resolveIconComponent";
import { useAuthStore } from "../store/authStore";

const AddRoundedIcon = resolveIconComponent(AddRoundedIconRaw);
const DeleteOutlineRoundedIcon = resolveIconComponent(DeleteOutlineRoundedIconRaw);
const EditRoundedIcon = resolveIconComponent(EditRoundedIconRaw);
const MoreVertRoundedIcon = resolveIconComponent(MoreVertRoundedIconRaw);

const addUserDefaultValues = {
  name: "",
  email: "",
  password: "",
  role: "viewer",
  status: "active",
};

const editUserDefaultValues = {
  name: "",
  email: "",
  password: "",
  role: "viewer",
  status: "active",
};

const UserManagementPage = () => {
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = String(currentUser?.role || "").toLowerCase() === "admin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [actionUser, setActionUser] = useState(null);
  const [editUserTarget, setEditUserTarget] = useState(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
  } = useForm({
    defaultValues: addUserDefaultValues,
  });

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
  } = useForm({
    defaultValues: editUserDefaultValues,
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers();
      setUsers(Array.isArray(response.users) ? response.users : []);
    } catch (error) {
      setUsers([]);
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to load users.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const userRows = useMemo(
    () => users.filter((user) => user.id !== currentUser?.id),
    [currentUser?.id, users],
  );

  const closeAddDialog = () => {
    if (submitting) {
      return;
    }

    setOpenAddDialog(false);
    resetAddForm(addUserDefaultValues);
  };

  const onSubmitUser = async (values) => {
    setSubmitting(true);
    try {
      await userService.createUser({
        name: values.name?.trim(),
        email: values.email?.trim(),
        password: values.password,
        role: values.role,
        status: values.status,
      });

      setSnackbar({
        open: true,
        message: "User added successfully.",
        severity: "success",
      });

      setOpenAddDialog(false);
      resetAddForm(addUserDefaultValues);
      await loadUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to add user.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openActionsMenu = (event, user) => {
    setActionAnchorEl(event.currentTarget);
    setActionUser(user);
  };

  const closeActionsMenu = () => {
    setActionAnchorEl(null);
  };

  const openEditUserDialog = () => {
    if (!actionUser) {
      return;
    }

    setEditUserTarget(actionUser);
    resetEditForm({
      name: actionUser.name || "",
      email: actionUser.email || "",
      password: "",
      role: actionUser.role || "viewer",
      status: actionUser.status || "active",
    });
    setOpenEditDialog(true);
    closeActionsMenu();
  };

  const closeEditDialog = () => {
    if (editing) {
      return;
    }

    setOpenEditDialog(false);
    setEditUserTarget(null);
    resetEditForm(editUserDefaultValues);
  };

  const onSubmitEditUser = async (values) => {
    if (!editUserTarget?.id) {
      return;
    }

    setEditing(true);
    try {
      const payload = {
        name: values.name?.trim(),
        email: values.email?.trim(),
        role: values.role,
        status: values.status,
      };

      if (values.password) {
        payload.password = values.password;
      }

      const response = await userService.updateUser(editUserTarget.id, payload);
      const updatedUser = response?.user;

      if (updatedUser?.id) {
        setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
      } else {
        await loadUsers();
      }

      setSnackbar({
        open: true,
        message: "User updated successfully.",
        severity: "success",
      });

      closeEditDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to update user.",
        severity: "error",
      });
    } finally {
      setEditing(false);
    }
  };

  const openDeleteUserDialog = () => {
    if (!actionUser) {
      return;
    }

    setDeleteUserTarget(actionUser);
    setOpenDeleteDialog(true);
    closeActionsMenu();
  };

  const closeDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setOpenDeleteDialog(false);
    setDeleteUserTarget(null);
  };

  const onDeleteUser = async () => {
    if (!deleteUserTarget?.id) {
      return;
    }

    setDeleting(true);
    try {
      await userService.deleteUser(deleteUserTarget.id);
      setUsers((prev) => prev.filter((user) => user.id !== deleteUserTarget.id));
      setSnackbar({
        open: true,
        message: "User deleted successfully.",
        severity: "success",
      });
      closeDeleteDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to delete user.",
        severity: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 2.3, border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 2.3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              User Management
            </Typography>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpenAddDialog(true)}>
              Add User
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={openAddDialog} onClose={closeAddDialog} fullWidth maxWidth="sm">
        <DialogTitle>Add User</DialogTitle>
        <Stack component="form" onSubmit={handleAddSubmit(onSubmitUser)}>
          <DialogContent>
            <Controller
              name="name"
              control={addControl}
              rules={{ required: "Name is required." }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Name"
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="email"
              control={addControl}
              rules={{
                required: "Email is required.",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter a valid email address.",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Email"
                  type="email"
                  fullWidth
                  sx={{ mt: 1.2 }}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="password"
              control={addControl}
              rules={{
                required: "Password is required.",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters.",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Password"
                  type="password"
                  fullWidth
                  sx={{ mt: 1.2 }}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="role"
              control={addControl}
              rules={{ required: "Role is required." }}
              render={({ field, fieldState }) => (
                <FormControl size="small" fullWidth sx={{ mt: 1.2 }} error={Boolean(fieldState.error)}>
                  <InputLabel>Role</InputLabel>
                  <Select {...field} label="Role">
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="viewer">Viewer</MenuItem>
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
              name="status"
              control={addControl}
              rules={{ required: "Status is required." }}
              render={({ field, fieldState }) => (
                <FormControl size="small" fullWidth sx={{ mt: 1.2 }} error={Boolean(fieldState.error)}>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
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
            <Button onClick={closeAddDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" startIcon={<AddRoundedIcon />} disabled={submitting}>
              {submitting ? "Adding..." : "Add User"}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>

      <Dialog open={openEditDialog} onClose={closeEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <Stack component="form" onSubmit={handleEditSubmit(onSubmitEditUser)}>
          <DialogContent>
            <Controller
              name="name"
              control={editControl}
              rules={{ required: "Name is required." }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Name"
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="email"
              control={editControl}
              rules={{
                required: "Email is required.",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter a valid email address.",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Email"
                  type="email"
                  fullWidth
                  sx={{ mt: 1.2 }}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="password"
              control={editControl}
              rules={{
                validate: (value) =>
                  !value || value.length >= 8 || "Password must be at least 8 characters.",
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Password"
                  type="password"
                  fullWidth
                  sx={{ mt: 1.2 }}
                  placeholder="Leave blank to keep current password"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="role"
              control={editControl}
              rules={{ required: "Role is required." }}
              render={({ field, fieldState }) => (
                <FormControl size="small" fullWidth sx={{ mt: 1.2 }} error={Boolean(fieldState.error)}>
                  <InputLabel>Role</InputLabel>
                  <Select {...field} label="Role">
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="viewer">Viewer</MenuItem>
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
              name="status"
              control={editControl}
              rules={{ required: "Status is required." }}
              render={({ field, fieldState }) => (
                <FormControl size="small" fullWidth sx={{ mt: 1.2 }} error={Boolean(fieldState.error)}>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
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
            <Button onClick={closeEditDialog} disabled={editing}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" startIcon={<EditRoundedIcon />} disabled={editing}>
              {editing ? "Updating..." : "Update User"}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={closeDeleteDialog} fullWidth maxWidth="xs">
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete <strong>{deleteUserTarget?.name || "this user"}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={onDeleteUser} disabled={deleting} startIcon={<DeleteOutlineRoundedIcon />}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu anchorEl={actionAnchorEl} open={Boolean(actionAnchorEl)} onClose={closeActionsMenu}>
        <MenuItem onClick={openEditUserDialog}>
          <EditRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={openDeleteUserDialog} sx={{ color: "error.main" }}>
          <DeleteOutlineRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

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
              "& .MuiTableHead-root .MuiTableCell-root": {
                borderBottomWidth: 1.5,
                borderBottomStyle: "solid",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 120 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 120 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 90 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ color: "text.secondary" }}>
                    {loading ? "Loading users..." : "No users found in database."}
                  </TableCell>
                </TableRow>
              ) : (
                userRows.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name || "-"}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>{user.role || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.status === "inactive" ? "Inactive" : "Active"}
                        color={user.status === "inactive" ? "default" : "success"}
                        variant={user.status === "inactive" ? "outlined" : "filled"}
                        sx={
                          user.status === "inactive"
                            ? undefined
                            : {
                                bgcolor: "#dcfce7",
                                color: "#14532d",
                                borderColor: "#86efac",
                              }
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {isAdmin && user.id !== currentUser?.id ? (
                        <IconButton size="small" onClick={(event) => openActionsMenu(event, user)}>
                          <MoreVertRoundedIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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

export default UserManagementPage;
