import DashboardOutlinedIconRaw from "@mui/icons-material/DashboardOutlined";
import CategoryOutlinedIconRaw from "@mui/icons-material/CategoryOutlined";
import LayersOutlinedIconRaw from "@mui/icons-material/LayersOutlined";
import Inventory2OutlinedIconRaw from "@mui/icons-material/Inventory2Outlined";
import AutoAwesomeMosaicOutlinedIconRaw from "@mui/icons-material/AutoAwesomeMosaicOutlined";
import PictureAsPdfOutlinedIconRaw from "@mui/icons-material/PictureAsPdfOutlined";
import AccountTreeOutlinedIconRaw from "@mui/icons-material/AccountTreeOutlined";
import SettingsOutlinedIconRaw from "@mui/icons-material/SettingsOutlined";
import ManageAccountsOutlinedIconRaw from "@mui/icons-material/ManageAccountsOutlined";
import resolveIconComponent from "../utils/resolveIconComponent";

const DashboardOutlinedIcon = resolveIconComponent(DashboardOutlinedIconRaw);
const CategoryOutlinedIcon = resolveIconComponent(CategoryOutlinedIconRaw);
const LayersOutlinedIcon = resolveIconComponent(LayersOutlinedIconRaw);
const Inventory2OutlinedIcon = resolveIconComponent(Inventory2OutlinedIconRaw);
const AutoAwesomeMosaicOutlinedIcon = resolveIconComponent(AutoAwesomeMosaicOutlinedIconRaw);
const PictureAsPdfOutlinedIcon = resolveIconComponent(PictureAsPdfOutlinedIconRaw);
const AccountTreeOutlinedIcon = resolveIconComponent(AccountTreeOutlinedIconRaw);
const SettingsOutlinedIcon = resolveIconComponent(SettingsOutlinedIconRaw);
const ManageAccountsOutlinedIcon = resolveIconComponent(ManageAccountsOutlinedIconRaw);

export const sidebarNavigation = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: DashboardOutlinedIcon,
    type: "link",
    allowedRoles: ["admin", "manager", "viewer"],
  },
  {
    key: "catalog",
    label: "Catalog",
    path: "/catalog",
    icon: AutoAwesomeMosaicOutlinedIcon,
    type: "link",
    allowedRoles: ["admin", "manager", "viewer"],
  },
  {
    key: "master",
    label: "Master",
    icon: AccountTreeOutlinedIcon,
    type: "group",
    allowedRoles: ["admin", "manager"],
    children: [
      {
        key: "categories",
        label: "Categories",
        path: "/categories",
        icon: CategoryOutlinedIcon,
        allowedRoles: ["admin", "manager"],
      },
      {
        key: "sub-categories",
        label: "Sub-Categories",
        path: "/sub-categories",
        icon: LayersOutlinedIcon,
        allowedRoles: ["admin", "manager"],
      },
      {
        key: "products",
        label: "Products",
        path: "/products",
        icon: Inventory2OutlinedIcon,
        allowedRoles: ["admin", "manager"],
      },
    ],
  },
  {
    key: "generate-pdf",
    label: "Generate PDF",
    path: "/generate-pdf",
    icon: PictureAsPdfOutlinedIcon,
    type: "link",
    allowedRoles: ["admin", "manager", "viewer"],
  },
  {
    key: "settings",
    label: "Settings",
    path: "/settings",
    icon: SettingsOutlinedIcon,
    type: "group",
    allowedRoles: ["admin"],
    children: [
      {
        key: "user-management",
        label: "User Management",
        path: "/settings/user-management",
        icon: ManageAccountsOutlinedIcon,
        allowedRoles: ["admin"],
      },
    ],
  },
];

export const breadcrumbLabelMap = {
  dashboard: "Dashboard",
  catalog: "Catalog",
  master: "Master",
  categories: "Categories",
  "sub-categories": "Sub-Categories",
  products: "Products",
  items: "Products",
  "generate-pdf": "Generate PDF",
  settings: "Settings",
  "user-management": "User Management",
};
