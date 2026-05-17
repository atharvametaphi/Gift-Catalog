import { Box, Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import AddRoundedIconRaw from "@mui/icons-material/AddRounded";
import Inventory2OutlinedIconRaw from "@mui/icons-material/Inventory2Outlined";
import PageHeader from "./PageHeader";
import resolveIconComponent from "../utils/resolveIconComponent";

const AddRoundedIcon = resolveIconComponent(AddRoundedIconRaw);
const Inventory2OutlinedIcon = resolveIconComponent(Inventory2OutlinedIconRaw);

const ManagementPlaceholder = ({ title, subtitle }) => (
  <Box>
    <PageHeader title={title} subtitle={subtitle} />

    <Card sx={{ mb: 2.5 }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title} Management
          </Typography>
          <Button variant="contained" disabled startIcon={<AddRoundedIcon />}>
            Add {title}
          </Button>
        </Stack>
      </CardContent>
    </Card>

    <Card sx={{ mb: 2.5 }}>
      <CardContent sx={{ p: 0 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} sx={{ color: "text.secondary" }}>
                No records yet. Data table wiring will be connected with module APIs.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Card>
      <CardContent sx={{ p: 4, textAlign: "center" }}>
        <Inventory2OutlinedIcon color="disabled" sx={{ fontSize: 42, mb: 1 }} />
        <Typography variant="h6" sx={{ mb: 0.8 }}>
          Management Module Coming Soon
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The architecture is ready for CRUD, workflows, and analytics extensions in this section.
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

export default ManagementPlaceholder;
