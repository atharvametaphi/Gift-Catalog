import DashboardOutlinedIconRaw from "@mui/icons-material/DashboardOutlined";
import CategoryOutlinedIconRaw from "@mui/icons-material/CategoryOutlined";
import LayersOutlinedIconRaw from "@mui/icons-material/LayersOutlined";
import Inventory2OutlinedIconRaw from "@mui/icons-material/Inventory2Outlined";
import AutoAwesomeMosaicOutlinedIconRaw from "@mui/icons-material/AutoAwesomeMosaicOutlined";
import PictureAsPdfOutlinedIconRaw from "@mui/icons-material/PictureAsPdfOutlined";
import AccountTreeOutlinedIconRaw from "@mui/icons-material/AccountTreeOutlined";
import resolveIconComponent from "../utils/resolveIconComponent";

const DashboardOutlinedIcon = resolveIconComponent(DashboardOutlinedIconRaw);
const CategoryOutlinedIcon = resolveIconComponent(CategoryOutlinedIconRaw);
const LayersOutlinedIcon = resolveIconComponent(LayersOutlinedIconRaw);
const Inventory2OutlinedIcon = resolveIconComponent(Inventory2OutlinedIconRaw);
const AutoAwesomeMosaicOutlinedIcon = resolveIconComponent(AutoAwesomeMosaicOutlinedIconRaw);
const PictureAsPdfOutlinedIcon = resolveIconComponent(PictureAsPdfOutlinedIconRaw);
const AccountTreeOutlinedIcon = resolveIconComponent(AccountTreeOutlinedIconRaw);

export const sidebarNavigation = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: DashboardOutlinedIcon,
    type: "link",
  },
  {
    key: "catalog",
    label: "Catalog",
    path: "/catalog",
    icon: AutoAwesomeMosaicOutlinedIcon,
    type: "link",
  },
  {
    key: "master",
    label: "Master",
    icon: AccountTreeOutlinedIcon,
    type: "group",
    children: [
      { key: "categories", label: "Categories", path: "/categories", icon: CategoryOutlinedIcon },
      { key: "sub-categories", label: "Sub-Categories", path: "/sub-categories", icon: LayersOutlinedIcon },
      { key: "items", label: "Items", path: "/items", icon: Inventory2OutlinedIcon },
    ],
  },
  {
    key: "generate-pdf",
    label: "Generate PDF",
    path: "/generate-pdf",
    icon: PictureAsPdfOutlinedIcon,
    type: "link",
  },
];

export const breadcrumbLabelMap = {
  dashboard: "Dashboard",
  catalog: "Catalog",
  master: "Master",
  categories: "Categories",
  "sub-categories": "Sub-Categories",
  items: "Items",
  "generate-pdf": "Generate PDF",
};
