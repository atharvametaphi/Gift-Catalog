import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { Categories } from './pages/Categories';
import { Subcategories } from './pages/Subcategories';
import { Items } from './pages/Items';
import { Catalogues } from './pages/Catalogues';
import { CatalogueDetail } from './pages/CatalogueDetail';
import { AllPdfs } from './pages/AllPdfs';
import { BulkUpload } from './pages/BulkUpload';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="size-full">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/items" replace />} />
                <Route path="categories" element={<Categories />} />
                <Route path="subcategories" element={<Subcategories />} />
                <Route path="items" element={<Items />} />
                <Route path="catalogues" element={<Catalogues />} />
                <Route path="catalogue/:id" element={<CatalogueDetail />} />
                <Route path="all-pdfs" element={<AllPdfs />} />
                <Route path="bulk-upload" element={<BulkUpload />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/items" replace />} />
            </Routes>
            <Toaster position="top-right" richColors />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
