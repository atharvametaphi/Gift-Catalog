Create a modern web application for a corporate gifting business.

The application will be used internally by the corporate gifting company to manage thousands of gifting products/items and generate professional PDF catalogues for limited corporate clients.

Build the application with a clean, professional, easy-to-use UI.

The application should include login, category management, subcategory management, item/product management, multiple image upload, item catalogue listing, PDF catalogue generation, bulk upload, and future-ready client access.

Core Purpose:
The business has thousands of corporate gifting products. Admin users should be able to organize products by category and subcategory, upload multiple images for each product, select products, choose images and grid layout, and generate a professional PDF catalogue for clients.

Authentication:
- Add a login system.
- Only authorized users should be able to access the application.
- After login, the user should land on a dashboard or product catalogue page.
- Add logout functionality.
- Use secure password handling.

User Roles:
- Admin users can create, edit, delete, and manage categories, subcategories, items, images, users, and PDF catalogues.
- Client users, if added later, should only be able to view assigned catalogues or products, not edit anything.
- Keep the architecture flexible so client login can be added later.

Main Sidebar Menu:
- Dashboard
- Categories
- Subcategories
- Items / Products
- Bulk Upload
- PDF Catalogue Generator
- Users
- Settings

1. Dashboard

Create a dashboard that shows:
- Total categories
- Total subcategories
- Total items/products
- Active items
- Inactive items
- Recently added items
- Recently generated catalogues, if available

Add quick action buttons:
- Add Category
- Add Subcategory
- Add Item
- Bulk Upload
- Generate PDF Catalogue

2. Category Management

Admin should be able to:
- Create category
- Edit category
- Delete category
- View category list
- Activate / deactivate category

Category fields:
- Category name
- Description, optional
- Status: Active / Inactive
- Created date
- Updated date

Example categories:
- Office Essentials
- Premium Gifts
- Tech Gifts
- Eco-Friendly Gifts
- Apparel
- Drinkware
- Bags
- Stationery

Important logic:
- Category name should be unique.
- Category should not be deleted if subcategories or items are linked to it.
- If linked records exist, show warning and allow admin to mark category inactive instead.

3. Subcategory Management

Admin should be able to:
- Create subcategory
- Edit subcategory
- Delete subcategory
- View subcategory list
- Activate / deactivate subcategory

Subcategory must be linked to one category.

Subcategory fields:
- Select category
- Subcategory name
- Description, optional
- Status: Active / Inactive
- Created date
- Updated date

Example:
Category: Tech Gifts
Subcategories:
- Power Banks
- Bluetooth Speakers
- Wireless Chargers
- USB Drives

Category: Drinkware
Subcategories:
- Bottles
- Mugs
- Tumblers

Important logic:
- Subcategory name should be unique under the selected category.
- Subcategory dropdown should show only active categories.
- Subcategory should not be deleted if items are linked to it.
- If linked items exist, show warning and allow admin to mark subcategory inactive instead.

4. Item / Product Management

Admin should be able to:
- Create item/product
- Edit item/product
- Delete item/product
- View item/product list
- Upload multiple images for each item
- Activate / deactivate item

While creating an item:
- Admin should first select category.
- Based on selected category, only related subcategories should appear.
- Admin should then select subcategory.
- Based on selected category and subcategory, item name can be suggested or auto-filled.
- The item name must remain editable so admin can customize it.

Item fields:
- Select category
- Select subcategory
- Item name
- Item code / SKU, optional
- Short description
- Detailed description, optional
- Price, optional
- Minimum order quantity, optional
- Available colors, optional
- Material, optional
- Size / dimensions, optional
- Branding options, optional
- Tags / chips, optional
- Status: Active / Inactive
- Multiple product images
- Created date
- Updated date

Multiple Image Upload:
- Each item should allow multiple images.
- Admin should be able to upload multiple images at once.
- Admin should be able to preview uploaded images.
- Admin should be able to reorder images.
- Admin should be able to delete individual images.
- One image should be marked as the primary image.
- The first uploaded image can be selected as primary by default.
- Admin should be able to change the primary image.
- The primary image should be shown in the item list.
- All images should be visible in the item detail page as a gallery.

Important item logic:
- Category is required.
- Subcategory is required.
- Item name is required.
- Item name should be editable even if auto-suggested.
- Item code / SKU should be unique if provided.
- At least one image should be recommended but not mandatory.
- Product should not break the UI if image is missing. Show placeholder image.

5. Item Listing / Product Catalogue Screen

Create a visually attractive item catalogue screen.

Each item card should show:
- Large product image
- Item name
- Category name
- Subcategory name
- Tags shown as chips
- Status badge
- Checkbox to select item for PDF catalogue
- View details button
- Edit button for admin
- Delete button for admin

The catalogue should support:
- Search by item name
- Search by SKU / item code
- Filter by category
- Filter by subcategory
- Filter by tags
- Filter by status
- Sort by newest
- Sort by oldest
- Sort by name A-Z
- Sort by name Z-A
- Pagination or infinite scroll because there may be thousands of items

Selection features:
- Each item card or row should have a checkbox.
- Admin should be able to select multiple products.
- Add “Select All Visible” option.
- Add “Select All Filtered Results” option if possible.
- Add “Clear Selection” option.
- Show selected item count.
- Add “Generate PDF Catalogue” button after items are selected.

6. Item Detail Page

When user clicks on an item, show a detailed product page.

Item detail page should show:
- Image gallery with multiple images
- Primary image highlighted
- Item name
- Category
- Subcategory
- SKU / item code
- Short description
- Detailed description
- Price if available
- MOQ if available
- Available colors
- Material
- Size / dimensions
- Branding options
- Tags / chips
- Status
- Admin edit button

7. PDF Catalogue Generator

Add a complete PDF catalogue generation feature for selected products/items.

Purpose:
Admin should be able to select multiple products/items and generate a professional PDF catalogue for clients.

PDF Catalogue Flow:
1. Admin goes to the Item Catalogue screen.
2. Admin selects multiple items using checkboxes.
3. Admin clicks “Generate PDF Catalogue”.
4. System opens a PDF setup screen or modal.
5. Admin configures PDF layout, selected fields, branding, and images.
6. Admin previews the PDF.
7. Admin downloads the final PDF.

PDF Product Selection:
- Admin can select products from item listing.
- Admin can also open PDF Catalogue Generator from sidebar.
- In PDF Catalogue Generator, show selected products.
- Admin should be able to add/remove products before generating PDF.
- Admin should be able to reorder selected products using drag and drop.
- Show selected product count.
- If no product is selected, show message: “Please select at least one product to generate catalogue.”

PDF Layout Options:
Admin should be able to choose grid layout:
- 1 product per row
- 2 products per row
- 3 products per row
- 4 products per row

PDF Page Options:
- A4 portrait
- A4 landscape
- Letter portrait, optional
- Letter landscape, optional

PDF Content Options:
Admin should be able to choose what information to show in the PDF:
- Product image
- Product name
- Category
- Subcategory
- SKU / item code
- Short description
- Price
- Minimum order quantity
- Tags / chips
- Branding options
- Material
- Size / dimensions

Add show/hide toggles for:
- Show price
- Show MOQ
- Show SKU
- Show category
- Show subcategory
- Show description
- Show tags
- Show branding options
- Show material
- Show dimensions

PDF Image Selection:
Since each item can have multiple images, admin should be able to select which image should be used in the PDF.

Image options:
- Use primary image automatically by default.
- Allow admin to choose a different image per item.
- Show image thumbnails for every selected item.
- Admin can select one image per product for the main PDF grid.
- Optional future scope: allow multiple images per item in PDF detail format.

PDF Design Customization:
Admin should be able to customize:
- Catalogue title
- Client/company name
- Cover page on/off
- Company logo
- Header text
- Footer text
- Page numbers on/off
- Contact details
- Theme color
- Show/hide company branding
- Show/hide pricing

PDF Cover Page:
If enabled, cover page should include:
- Company logo
- Catalogue title
- Client/company name
- Date
- Optional subtitle
- Contact details

PDF Product Card Design:
Each product card in the PDF should show:
- Product image
- Product name
- Category/subcategory if enabled
- SKU if enabled
- Description if enabled
- Price if enabled
- MOQ if enabled
- Tags/chips if enabled
- Other selected fields

PDF Preview:
Before downloading, show a preview of the PDF layout.
Admin should be able to go back and change:
- Selected products
- Product order
- Grid layout
- Product image for each item
- Fields shown in PDF
- Title and branding details
- Page size and orientation

PDF Download:
- Generate a clean, professional, client-ready PDF.
- File name should be customizable.
- Default file name format:
  Corporate-Gifting-Catalogue-ClientName-Date.pdf

PDF Technical Requirements:
- PDF should support many products.
- Images should be optimized before PDF generation.
- PDF layout should not break if product names or descriptions are long.
- Each product card should have consistent spacing.
- Grid should automatically continue on the next page.
- PDF should be downloadable from browser.
- PDF should look professional for corporate clients.
- Use proper margins, alignment, typography, and spacing.

Important PDF Logic:
- Admin can generate PDF only after selecting one or more items.
- For each selected item, use the primary image by default.
- Admin can manually change the image used in PDF before generation.
- Admin can select grid format before generating PDF.
- Admin can choose whether price should be visible or hidden.
- Admin can preview PDF before download.
- PDF should be suitable to send directly to clients.

8. Bulk Upload Requirement

Since the business may have thousands of items, add provision for bulk upload.

Admin should be able to:
- Upload products using CSV or Excel file.
- Map columns like category, subcategory, item name, description, price, tags, etc.
- Validate data before import.
- Show import preview before saving.
- Show import success and error report.
- Avoid duplicate item creation based on SKU or item name.
- Create missing categories/subcategories only if admin allows.
- Images can be uploaded manually for now, but keep architecture flexible for bulk image upload later.

Bulk upload fields:
- Category
- Subcategory
- Item name
- SKU / item code
- Short description
- Detailed description
- Price
- MOQ
- Colors
- Material
- Dimensions
- Branding options
- Tags
- Status

Bulk upload validation:
- Category is required.
- Subcategory is required.
- Item name is required.
- SKU must be unique if provided.
- Invalid rows should be shown with row number and error reason.
- Admin should be able to download error report.

9. Users Module

Admin should be able to:
- Create users
- Edit users
- Deactivate users
- Assign role

User fields:
- Full name
- Email
- Password
- Role: Admin / Client
- Status: Active / Inactive

For now, focus mainly on Admin users.
Keep Client role ready for future use.

10. Settings Module

Settings should include:
- Company name
- Company logo
- Contact email
- Contact phone
- Address
- Default PDF header
- Default PDF footer
- Default theme color
- Default currency
- Default page size for PDF
- Default PDF orientation

11. Suggested Database Structure

Users table:
- id
- name
- email
- password_hash
- role
- status
- created_at
- updated_at

Categories table:
- id
- name
- description
- status
- created_at
- updated_at

Subcategories table:
- id
- category_id
- name
- description
- status
- created_at
- updated_at

Items table:
- id
- category_id
- subcategory_id
- item_name
- item_code
- short_description
- detailed_description
- price
- minimum_order_quantity
- colors
- material
- dimensions
- branding_options
- tags
- status
- created_at
- updated_at

Item Images table:
- id
- item_id
- image_url
- image_order
- is_primary
- created_at
- updated_at

PDF Catalogues table:
- id
- catalogue_title
- client_name
- file_name
- file_url
- selected_item_ids
- layout_type
- page_size
- orientation
- show_price
- show_moq
- show_sku
- show_category
- show_subcategory
- show_description
- show_tags
- created_by
- created_at
- updated_at

Settings table:
- id
- company_name
- logo_url
- contact_email
- contact_phone
- address
- default_pdf_header
- default_pdf_footer
- default_theme_color
- default_currency
- created_at
- updated_at

12. UI/UX Requirements

Use a modern dashboard layout.

General UI:
- Clean, professional design
- Collapsible sidebar
- Top header with user profile/logout
- Responsive design for desktop, tablet, and mobile
- Clear buttons and icons
- Cards for product display
- Tables for category and subcategory management
- Chips/tags for category, subcategory, and product tags
- Status badges for Active/Inactive
- Confirmation popups before deleting
- Toast notifications for success and error messages
- Loading states
- Empty states
- Form validation messages
- Search and filter bar

Product UI:
- Product cards should be visually attractive.
- Product image should be large and clear.
- Product cards should support selection for PDF generation.
- Selected products should be visually highlighted.
- Product detail page should look like a mini catalogue page.

PDF Generator UI:
- Step-based flow:
  Step 1: Selected Products
  Step 2: Choose Product Images
  Step 3: Choose Layout and Fields
  Step 4: Branding and Cover Page
  Step 5: Preview and Download

13. Important Business Logic

- A category can have many subcategories.
- A subcategory belongs to one category.
- An item belongs to one category and one subcategory.
- Subcategory dropdown depends on selected category.
- Item name can be auto-suggested based on category and subcategory but must be editable.
- Each item can have multiple images.
- Each item should have one primary image.
- Primary image is used in item listing and PDF by default.
- Admin can choose a different image for PDF.
- Category or subcategory should not be deleted if linked items exist.
- Items should be searchable and filterable because there may be thousands of products.
- PDF catalogue should be generated only from selected products.
- PDF should allow grid selection and field visibility customization.
- PDF should be professional enough to share with corporate clients.

14. Future Scope

Keep the code architecture flexible for:
- Client login
- Client-specific product catalogues
- Client-specific pricing
- Wishlist or inquiry cart
- Product sharing link
- Save generated PDF catalogues
- Share PDF catalogue by link
- Send PDF by email
- Quotation generation
- Product approval workflow
- Bulk image upload
- AI-based product name suggestions
- Advanced catalogue templates
- Watermark in PDF
- Expiry date for shared catalogue links

15. Technical Expectations

Build the application with:
- Clean and reusable components
- Proper database relationships
- Proper validation
- Secure authentication
- Scalable structure for thousands of products
- Optimized image handling
- Good error handling
- Clean folder structure
- Responsive UI
- Maintainable code

Before coding, first provide:
1. Final feature list
2. Page-wise structure
3. Database schema
4. User flow
5. Questions if any business logic is unclear

Do not start coding immediately until the structure is confirmed.