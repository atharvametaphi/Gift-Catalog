import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import CatalogItemDetailsPage from "../pages/CatalogItemDetailsPage";
import CatalogPage from "../pages/CatalogPage";
import CategoriesPage from "../pages/CategoriesPage";
import DashboardPage from "../pages/DashboardPage";
import GeneratePdfPage from "../pages/GeneratePdfPage";
import ItemsPage from "../pages/ItemsPage";
import LoginPage from "../pages/LoginPage";
import SubCategoriesPage from "../pages/SubCategoriesPage";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route path="/" element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="dashboards" element={<Navigate to="/dashboard" replace />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="sub-categories" element={<SubCategoriesPage />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="catalog/items/:itemId" element={<CatalogItemDetailsPage />} />
        <Route path="generate-pdf" element={<GeneratePdfPage />} />
        <Route path="catalog/categories" element={<Navigate to="/categories" replace />} />
        <Route path="catalog/sub-categories" element={<Navigate to="/sub-categories" replace />} />
        <Route path="catalog/items" element={<Navigate to="/items" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
