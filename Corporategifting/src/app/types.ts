export interface Role {
  id: string;
  name: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'manager' | 'viewer' | string;
  roleId?: string;
  permissions: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemImage {
  id: string;
  itemId: string;
  imageUrl: string;
  imageOrder: number;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  categoryId: string;
  subcategoryId: string;
  itemName: string;
  itemCode?: string;
  shortDescription: string;
  detailedDescription?: string;
  price?: number;
  minimumOrderQuantity?: number;
  colors?: string;
  material?: string;
  dimensions?: string;
  brandingOptions?: string;
  tags?: string[];
  status: 'active' | 'inactive';
  images: ItemImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CatalogueProduct {
  itemId: string;
  selectedImageId: string;
}

export interface Catalogue {
  id: string;
  catalogueTitle: string;
  clientName: string;
  notes?: string;
  products: CatalogueProduct[];
  showPrice: boolean;
  showSku: boolean;
  showMoq: boolean;
  showCategory: boolean;
  showSubcategory: boolean;
  showDescription: boolean;
  showTags: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  categoryId?: string;
  subcategoryId?: string;
  status?: 'active' | 'inactive';
  backendDescription?: string;
}

export interface PDFCatalogue {
  id: string;
  catalogueId: string;
  catalogueTitle: string;
  clientName: string;
  fileName: string;
  pdfDataUrl: string;
  gridLayout: '9' | '16';
  productCount: number;
  createdBy: string;
  createdAt: Date;
}

export interface Settings {
  id: string;
  companyName: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  defaultPdfHeader: string;
  defaultPdfFooter: string;
  defaultThemeColor: string;
  defaultCurrency: string;
  createdAt: Date;
  updatedAt: Date;
}
