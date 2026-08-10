# SDD Change: Products Catalog Grid & PDF

## Requirement

The products page must support two view modes — table and grid — toggled by the user with preference persisted locally. A new `GET /api/portal/products/catalog/pdf` endpoint must stream a commercial catalog PDF with the customer's products, images, and prices. Product images must render in both views with a fallback when missing. All existing filtering, search, pagination, row-click detail, and empty-state behavior must remain consistent across views.

## Scenarios

### Feature: PDF Catalog Download

#### Scenario: Backend streams catalog PDF

- GIVEN an authenticated portal user with a customer
- WHEN `GET /api/portal/products/catalog/pdf` is called
- THEN the response has Content-Type `application/pdf` and Content-Disposition `attachment; filename="catalogo-comercial.pdf"`
- AND the PDF contains products grouped by category with image, SKU, description, and customer-specific price per product
- AND a title/header "Catálogo Comercial" with generation date

#### Scenario: Download button triggers download

- GIVEN the products page is loaded with products visible
- WHEN the user clicks the "Descargar Catálogo PDF" button in the toolbar
- THEN the browser initiates a file download of the catalog PDF
- AND a loading spinner shows on the button while the request is in flight

#### Scenario: Download with empty product list

- GIVEN the customer has no products
- WHEN the products page renders in empty state
- THEN the download button is disabled or hidden

#### Scenario: Download fails

- GIVEN the PDF generation fails (server error or timeout)
- WHEN the download request completes with an error
- THEN an error toast "No se pudo generar el catálogo" is shown

### Feature: Grid View Display

#### Scenario: Grid renders product cards

- GIVEN the products page is in grid view mode
- WHEN products are loaded
- THEN products render as cards in a responsive grid (2–4 columns by viewport)
- AND each card shows: product image, name, SKU, category badge, customer price, and stock indicator

#### Scenario: Grid respects product order

- GIVEN the server returns products in default order
- WHEN grid view renders
- THEN cards appear in the same order as the server response

### Feature: View Toggle

#### Scenario: Toggle switches between table and grid

- GIVEN the products page has products loaded
- WHEN the user clicks the view toggle button
- THEN the display switches between table view and grid view
- AND the toggle button icon updates to indicate the current mode

#### Scenario: Filter state survives view switch

- GIVEN the user has applied a search term and category filter
- WHEN the user toggles between table and grid views
- THEN the search term, selected category, current page, and page size remain unchanged

#### Scenario: Row click opens detail in table view

- GIVEN table view with products
- WHEN the user clicks a table row
- THEN the detail dialog opens showing the product's full information including image

#### Scenario: Card click opens detail in grid view

- GIVEN grid view with product cards
- WHEN the user clicks a product card
- THEN the detail dialog opens showing the product's full information including image

### Feature: Product Images

#### Scenario: Photo renders in table view

- GIVEN table view and a product with a valid `photo` path
- WHEN the table renders
- THEN a thumbnail (40×40px) appears in a new image column before the code column
- AND the image URL is constructed as `/api/files/{photo}`

#### Scenario: Photo renders in grid card

- GIVEN grid view and a product with a valid `photo` path
- WHEN cards render
- THEN the product image fills the card's top area with object-cover behavior

#### Scenario: Photo renders in detail dialog

- GIVEN the detail dialog is open for a product with a valid `photo`
- WHEN the dialog renders
- THEN the product image appears at the top of the dialog content

#### Scenario: Missing photo shows fallback

- GIVEN a product where `photo` is null or empty
- WHEN the product renders in any view or dialog
- THEN a placeholder icon (`pi pi-image` with background) displays instead
- AND the placeholder matches the image area dimensions for that view

#### Scenario: Broken image URL shows fallback

- GIVEN a product with a non-null `photo` value where the image fails to load (404/network error)
- WHEN the browser attempts to load the image
- THEN the same placeholder fallback replaces the broken image via onError handler

### Feature: Filtering & Pagination Consistency

#### Scenario: Search works in both views

- GIVEN the user enters a search term with 300ms debounce
- WHEN products reload in either table or grid view
- THEN filtered results display and pagination resets to page 0

#### Scenario: Category filter works in both views

- GIVEN the user selects a category from the dropdown
- WHEN products reload in either view
- THEN only products from that category are shown and pagination resets

#### Scenario: Pagination works in both views

- GIVEN more than one page of products
- WHEN the user navigates pages or changes page size (10/20/50)
- THEN the correct page renders in both table and grid views

#### Scenario: Empty state shows after no-results search

- GIVEN a search term that matches no products
- WHEN products reload
- THEN the "Sin resultados" empty state renders in both table and grid views

## Acceptance Criteria

1. `GET /api/portal/products/catalog/pdf` endpoint streams PDF with correct headers and content
2. Products page toolbar has a "Descargar Catálogo PDF" button with loading state and error handling
3. View toggle button switches between p-table and responsive CSS grid of product cards
4. Product images render via `/api/files/{photo}` in table thumbnail column, grid cards, and detail dialog
5. Missing or broken images show the `pi-image` placeholder fallback consistently
6. Search, category filter, pagination, row/card click detail, and empty states behave identically across views
7. Products page renders correctly at viewport widths 360px–1440px
